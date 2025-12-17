import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import lineFragment from "./shaders/lineFragment.glsl";
import { analyzeAirtableData } from "./utils/d3Analysis";
import { useStore } from "./utils/useStore";
// import { seededRandom } from "three/src/math/MathUtils.js";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";


gsap.registerPlugin(useGSAP);



const CustomGeometryParticles = ({ count, originalData, groupIndex }) => {

  const particleTexture = useLoader(THREE.TextureLoader, "/particle/star_04.png");

  
  const points = useRef();
  const { gl, raycaster, camera } = useThree();
  
  useEffect(() => {
    raycaster.near = 0;
    raycaster.far = 1000;
    gl.setClearColor('#000000', 1);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, raycaster]);

  // Update threshold based on camera distance - smaller threshold when close, larger when far
  // This prevents selecting wrong points when they're close together
  useFrame(() => {
    if (!camera || !raycaster.params.Points) return;
    
    const cameraDistance = Math.abs(camera.position.z);
    // Adaptive threshold: smaller when camera is close (more precision), larger when far
    // At z=50: threshold ~12 (precise), at z=100: threshold ~20 (still precise but reachable)
    // This balances clickability with precision for close points
    const threshold = Math.max(8, Math.min(15, cameraDistance * 0.2));
    raycaster.params.Points.threshold = threshold;
  });

  const { filters, setSelectedCinema, setAnimateParticles, data } = useStore();

  const animateParticles = useCallback(() => {

    gsap.fromTo(
      points.current.material.uniforms.uPosition,
      { value: 0.0 },
      {
        value: 20.0,
        duration: 3,
        ease:"sine.inOut",
      }
    );
  }, []);

  useEffect(() => {
    setAnimateParticles(animateParticles);
  }, [setAnimateParticles]);


  // Handle click on particles
  // R3F's onPointerDown already provides the closest intersection via e.index
  // With adaptive threshold, we get better precision for close points
  const handleClick = (e) => {
    e.stopPropagation();
    
    // e.index is already the closest point (R3F sorts intersections by distance)
    if (typeof e.index !== 'number' || e.index < 0) return;
    
    const pointIndex = e.index;
    if (pointIndex < originalData.length) {
      const cinema = originalData[pointIndex];
      if (cinema?.id) {
        setSelectedCinema(cinema);
      }
    }
  };

  const uniforms = useMemo(() => {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    return {
      uTime: { value: 0.0 },
      uSize: { value: 15.0 },
      uPosition: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uDevicePixelRatio: { value: dpr },
      uTexture: { value: particleTexture }
    };
  }, [particleTexture]);

  // Calculate dynamic radius based on particle count
  // Fewer particles = smaller radius (more concentrated, appear larger)
  // More particles = larger radius (more spread out)
  const radius = useMemo(() => {
    if (!data || data.length === 0 || count === 0) return 300;
    
    const totalCount = data.length;
    const filteredCount = count;
    const ratio = filteredCount / totalCount; // 0 to 1
    
    // Base radius when all particles visible
    const baseRadius = 300;
    // Minimum radius when very few particles (more concentrated)
    const minRadius = 100;
    // Maximum radius when many particles
    const maxRadius = 300;
    
    // Scale radius linearly based on ratio
    // When ratio is low (few particles), use smaller radius
    // When ratio is high (many particles), use larger radius
    const dynamicRadius = minRadius + (maxRadius - minRadius) * ratio;
    
    return dynamicRadius;
  }, [data, count]);


  

  // Create a set of featured cinema IDs for quick lookup
  const featuredCinemas = useMemo(() => {
    const preparedData = analyzeAirtableData(originalData);
    const featured = new Set();
    
    if (preparedData?.Feature?.[1]?.[1]) {
      preparedData.Feature[1][1].forEach((cinema) => {
        featured.add(cinema.id);
      });
    }
    
    return featured;
  }, [originalData]);

  const { positions, groups, scales, colors } = useMemo(() => {
   
    const groups = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    // Simple seeded random function
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const cinema = originalData[i];
      // const fields = cinema.fields;
      // const country = fields?.Country || "Unknown";

     
      

      groups[i] = groupIndex; // All particles in this system belong to the same group

      // Use cinema ID as seed for consistent random values
      // const seed = cinema.id ? cinema.id.charCodeAt(0) + i : i;
      let seed = i;
if (cinema.id) {
  for (let j = 0; j < cinema.id.length; j++) {
    seed += cinema.id.charCodeAt(j) * (j + 1);
  }
}
      
      // Check if this cinema is featured using the same method as featuredCinemas Set
      const isFeatured = featuredCinemas.has(cinema.id);
      
      if (isFeatured) {
        scales[i] = 5.0; // Large scale for featured cinemas
        colors.set([1.0, 0.84, 0.0], i * 3); // Gold color for featured cinemas
      } else {
       // Random scale for non-featured cinemas (1.0 to 2.5)
       scales[i] = Math.random() * 1.5 + 1.0; 
        colors.set([1.0,1.0,1.0], i * 3); // Default color for non-featured cinemas
      }
    
      // Use simple random positioning (vertex shader will add Perlin noise)
      // Use sqrt distribution for uniform spread across 2D area (not clustered at center)
      // Use seeded random for consistent, deterministic positioning
      const distance = Math.sqrt(seededRandom(seed + 1)) * radius;
      const angle = seededRandom(seed + 2) * Math.PI * 2; // Full circle in radians

      let x = distance * Math.cos(angle);
      let y = distance * Math.sin(angle) + 10;
      let z = 0;

      // add the 3 values to the attribute array for every loop
      positions.set([x, y, 0], i * 3);
    }

    return { positions, groups, scales, colors };
  }, [count, groupIndex, originalData, featuredCinemas, radius]);

  useFrame((state) => {
    if (!points.current?.material) return;
    points.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const lineGeometry = useMemo(() => {
    if (!positions || positions.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  useGSAP(() => {
    if (!points.current) return; // don’t animate yet if geometry isn’t ready

    gsap.fromTo(
      camera.position,
      { z: 300 },
      { z: 100, duration: 2, ease: "power2.out" }
    );
    // return null;
  }, [points.current, camera]);


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
        <bufferGeometry ref={pointsGeometryRef} key={positions.length}>
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

export default function Scene({ fullData }) {
  const {

    setData, 
    setFilters,
    filteredData,
    setLoading,
    setProgress,
  
  } = useStore();

  const [count, setCount] = useState(0);
  // console.log("animateParticles in component:", animateParticles);

  const initialFilters = {};
  // Initialize with data
  useEffect(() => {
    if (fullData && fullData.length > 0) {
      // console.log(
      //   " Initializing with full data:",
      //   fullData.length,
      //   "records"
      // );

      setCount(fullData.length);
      setData(fullData);

      // Prepare data with D3
      const prepared = analyzeAirtableData(fullData);
      Object.keys(prepared).forEach((field) => {
        initialFilters[field] = "all";
      });
      setFilters(initialFilters);

      // setAirtableData(prepared);

      // Set loading as complete
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
      {/* <OrthographicCamera
          near={0.1}
          far={1000}
          makeDefault
          position={[0, 0, 50]}
          left={sizes.width / -2}
          right={sizes.width / 2}
          top={sizes.height / 2}
          bottom={sizes.height / -2}
        /> */}
      {/* <ambientLight intensity={1} /> */}

     

      {filteredData && (
        <>
          <CustomGeometryParticles
            data={filteredData}
            originalData={filteredData}
            count={filteredData.length}
            groupType="all"
            groupIndex={7}
        
          />
        </>
      )}

      <OrbitControls
        enableRotate={false}
        panSpeed={1.2}
        maxDistance={210}
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
