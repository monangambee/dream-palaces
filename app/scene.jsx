/**
 * Scene – Three.js Particle System
 *
 * Renders every cinema record as a GPU-driven particle inside an R3F
 * <Canvas>. The particle cloud is the heart of the "Constellation" view.
 *
 * Key behaviours:
 *  - Each particle's position is deterministically seeded from its record
 *    ID so that the same cinema always lands in the same spot.
 *  - "Featured" cinemas are rendered in gold at 2× scale.
 *  - Filters trigger a GSAP animation (uPosition uniform) that visually
 *    disperses and re-gathers particles.
 *  - Clicking a particle sets selectedCinema in the Zustand store,
 *    which opens the CinemaInfo detail panel.
 *  - Camera zooms in when filters are active, zooms out when cleared.
 */
import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import fragment from "./shaders/fragment.glsl"
import vertex from "./shaders/vertex.glsl"
import lineFragment from "./shaders/lineFragment.glsl"
import { analyzeAirtableData } from "./utils/d3Analysis"
import { useStore } from "./utils/useStore"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"


gsap.registerPlugin(useGSAP);



/**
 * CustomGeometryParticles
 * Renders the particle cloud for the given dataset slice.
 * Each particle maps 1:1 to a cinema record.
 */
const CustomGeometryParticles = ({ count, originalData, groupIndex }) => {

  const particleTexture = useLoader(THREE.TextureLoader, "/particle/star_04.png");
  const goldenTexture = useLoader(THREE.TextureLoader, "/particle/starGolden.png");

  
  const points = useRef();
  const { gl, raycaster, camera } = useThree();
  
  // Configure raycaster so particle clicks register reliably
  useEffect(() => {
    raycaster.near = 0
    raycaster.far = 1000
    raycaster.params.Points.threshold = 15
    gl.setClearColor('#000000', 1)
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [gl, raycaster])

  const { filters, setSelectedCinema, setAnimateParticles, data } = useStore();

  /** GSAP tween that "pulses" particles via the uPosition shader uniform */
  const animateParticles = useCallback(() => {
    gsap.fromTo(
      points.current.material.uniforms.uPosition,
      { value: 0.0 },
      {
        value: 10.0, // Reduced from 20.0 to prevent particles from overlapping
        duration: 3,
        ease:"sine.inOut",
      }
    );
  }, []);

  useEffect(() => {
    setAnimateParticles(animateParticles);
  }, [setAnimateParticles]);


  /** When a particle is clicked, look up its record and select it */
  const handleClick = (e) => {
    e.stopPropagation();
    if (typeof e.index !== 'number' || e.index < 0) return;
    
    const pointIndex = e.index;
    if (pointIndex < originalData.length) {
      const cinema = originalData[pointIndex];
      if (cinema?.id) {
        setSelectedCinema(cinema);
      }
    }
  };


  // Shader uniforms shared by points and line materials
  const uniforms = useMemo(() => {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    return {
      uTime: { value: 0.0 },
      uSize: { value: 30.0 * gl.getPixelRatio() },
      uPosition: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uDevicePixelRatio: { value: gl.getPixelRatio() },
      uTexture: { value: particleTexture },
      uGoldenTexture: { value: goldenTexture }
    };
  }, [particleTexture, goldenTexture]);

  // Adaptive cloud radius: scales with the number of visible particles
  const radius = useMemo(() => {
    if (!data || data.length === 0 || count === 0) return 400;
    
    const totalCount = data.length;
    const ratio = count / totalCount;
    const minRadius = 100;
    const maxRadius = Math.max(200, Math.sqrt(count) * 15);
    
    return minRadius + (maxRadius - minRadius) * ratio;
  }, [data, count]);

  // Set of cinema IDs flagged as "featured" (rendered larger & gold)
  const featuredCinemas = useMemo(
    () => new Set(originalData?.filter(c => c.fields?.Feature).map(c => c.id)),
    [originalData]
  );

  /**
   * Build all per-particle buffer attributes in one pass:
   * positions, group indices, scales, colours, and featured flags.
   * Uses a seeded-random function so positions are stable across renders.
   */
  const { positions, groups, scales, colors, featured } = useMemo(() => {
    const groups = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const featured = new Float32Array(count);

    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 1000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const cinema = originalData[i];
      groups[i] = groupIndex;

      let seed = i;
      if (cinema.id) {
        for (let j = 0; j < cinema.id.length; j++) {
          seed += cinema.id.charCodeAt(j) * (j + 1);
        }
      }

      const isFeatured = featuredCinemas.has(cinema.id);
      featured[i] = isFeatured ? 1.0 : 0.0;

      // const baseScale = Math.random() * 1.0 + 0.5;

      const baseScale = Math.pow(Math.random(), 2) * 2.5 + 0.5

      if (isFeatured) {
        scales[i] = baseScale * 10.0;
        colors.set([1.0, 0.843, 0.0], i * 3);
      } else {
        scales[i] = baseScale;
        colors.set([1.0, 1.0, 1.0], i * 3);
      }

      const distance = Math.sqrt(seededRandom(seed + 1)) * radius;
      const angle = seededRandom(seed + 2) * Math.PI * 2;

      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle) + 10;
      const z = 0

      positions.set([x, y, z], i * 3);
    }

    return { positions, groups, scales, colors, featured };
  }, [count, groupIndex, originalData, featuredCinemas, radius]);

  // Advance the uTime uniform every frame for shader animations
  useFrame((state) => {
    if (!points.current?.material) return;
    points.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  // Line geometry connecting particles (visible only when filters are active)
  const lineGeometry = useMemo(() => {
    if (!positions || positions.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  // Initial camera zoom-out + first particle animation on mount
  useGSAP(() => {
    
    if (!points.current) return; // don’t animate yet if geometry isn’t ready

    gsap.fromTo(
      camera.position,
      { z: 100 },
      { z: 400, duration: 2, ease: "power2.out" }
    );

    animateParticles();
    // return null;
  }, [points.current, camera]);

  // Camera zoom: closer when a filter is active, further when showing all
  useEffect(() => {
    if (!camera) return

    const hasActiveFilter = filters && Object.values(filters).some(val => val !== 'all')
    const targetZ = hasActiveFilter ? 100 : 400

    gsap.to(camera.position, {
      z: targetZ,
      duration: 1.5,
      ease: 'power2.inOut'
    })
  }, [filters, camera])


  const pointsGeometryRef = useRef();

  return (
    <>
      {lineGeometry &&
        filters &&
        Object.values(filters).some((value) => value !== "all") && (
          <line geometry={lineGeometry}>
            <shaderMaterial
              fragmentShader={lineFragment}
              vertexShader={vertex}
              uniforms={uniforms}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
            />
          </line>
        )}

      <points
        ref={points}
        onPointerDown={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <bufferGeometry key={positions.length}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-group"
            count={groups.length}
            array={groups}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={scales.length}
            array={scales}
            itemSize={1}
          />
             <bufferAttribute
            attach="attributes-aFeatured"
            count={featured.length}
            array={featured}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          depthWrite={false}
          fragmentShader={fragment}
          vertexShader={vertex}
          uniforms={uniforms}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

/**
 * Scene (default export)
 *
 * Entry point rendered inside the R3F <Canvas>.
 * Feeds filtered data from the Zustand store into
 * CustomGeometryParticles and configures OrbitControls.
 */
export default function Scene({ fullData }) {
  const {
    setData, 
    setFilters,
    filteredData,
    setLoading,
    setProgress,
  } = useStore();

  const [count, setCount] = useState(0)

  const initialFilters = {}

  // On first data load: populate store+filters and mark loading complete
  useEffect(() => {
    if (fullData && fullData.length > 0) {
      setCount(fullData.length);
      setData(fullData);

      const prepared = analyzeAirtableData(fullData);
      Object.keys(prepared).forEach((field) => {
        initialFilters[field] = "all";
      });
      setFilters(initialFilters);

      setLoading(false);
      setProgress({
        loaded: fullData.length,
        total: fullData.length,
        percentage: 100,
      });
    }
  }, [fullData]);

  return (
    <>
      {filteredData && (
        <CustomGeometryParticles
          originalData={filteredData}
          count={filteredData.length}
          groupIndex={7}
        />
      )}

      <Stars radius={500} depth={10} count={1000} factor={5} saturation={1} fade speed={1} />



      <OrbitControls
        enableRotate={false}
        panSpeed={1.2}
        maxDistance={400}
        minDistance={10}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE
        }}
      />
    </>
  );
}
