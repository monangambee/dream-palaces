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



const CustomGeometryParticles = ({ count, originalData, groupIndex, fullDataForNormalization }) => {

  const particleTexture = useLoader(THREE.TextureLoader, "/particle/star_04.png");
  const goldenTexture = useLoader(THREE.TextureLoader, "/particle/starGolden.png");

  
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
  // useFrame(() => {
  //   if (!camera || !raycaster.params.Points) return;
    
  //   const cameraDistance = Math.abs(camera.position.z);
  //   // Adaptive threshold: smaller when camera is close (more precision), larger when far
  //   // At z=50: threshold ~12 (precise), at z=100: threshold ~20 (still precise but reachable)
  //   // This balances clickability with precision for close points
  //   const threshold = Math.max(8, Math.min(15, cameraDistance * 0.2));
  //   raycaster.params.Points.threshold = threshold;
  // });

  const { filters, setSelectedCinema, setAnimateParticles, data } = useStore();

  const animateParticles = useCallback(() => {

    gsap.fromTo(
      points.current.material.uniforms.uPosition,
      { value: 0.0 },
      {
        value: 8.0, // Reduced from 20.0 to prevent particles from overlapping
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
    // const { gl } = useThree();


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

  // Calculate dynamic radius based on particle count
  // Increased radius to prevent particles from touching
  // Accounts for particle sizes (up to 5.0 scale) and ensures minimum spacing
  const radius = useMemo(() => {
    if (!data || data.length === 0 || count === 0) return 400;
    
    const totalCount = data.length;
    const filteredCount = count;
    const ratio = filteredCount / totalCount; // 0 to 1
    
    // Significantly increased radius to ensure particles don't touch
    // Minimum radius when very few particles
    const minRadius = 100;
    // Maximum radius when many particles - scale with count to maintain spacing
    const maxRadius = Math.max(200, Math.sqrt(filteredCount) * 15); // Scale with sqrt of count
    
    // Scale radius linearly based on ratio, but ensure minimum spacing
    // When ratio is low (few particles), use smaller radius
    // When ratio is high (many particles), use larger radius
    const dynamicRadius = minRadius + (maxRadius - minRadius) * ratio;
    
    return dynamicRadius;
  }, [data, count]);


  

  // Create a set of featured cinema IDs for quick lookup
  // Only cinemas with featured = true should be yellow
  const featuredCinemas = useMemo(() => {
    const featured = new Set();
    
    if (originalData && originalData.length > 0) {
      originalData.forEach((cinema) => {
        // Check if featured field is true (case-insensitive check)
        const featuredValue = cinema.fields?.featured || cinema.fields?.Featured;
        if (featuredValue === true || featuredValue === 'true' || featuredValue === 'True') {
          featured.add(cinema.id);
        }
      });
    }
    
    return featured;
  }, [originalData]);

  // Calculate data richness score for a cinema record
  const calculateDataRichness = useCallback((cinema) => {
    if (!cinema?.fields) return 0;
    
    const fields = cinema.fields;
    let score = 0;
    
    // Basic fields (1 point each)
    if (fields.Name) score += 1;
    if (fields.City) score += 1;
    if (fields.Country) score += 1;
    if (fields.Creation) score += 1;
    if (fields.Closure) score += 1;
    if (fields.Condition) score += 1;
    
    // Rich content fields (weighted more heavily)
    if (fields.Images && Array.isArray(fields.Images) && fields.Images.length > 0) {
      score += 2; // Images are valuable
    }
    if (fields["Website description"] && fields["Website description"].trim().length > 0) {
      score += 2; // Description adds significant value
    }
    if (fields["Additional resources"] && fields["Additional resources"].trim().length > 0) {
      score += 2; // Additional resources are valuable
    }
    if (fields["Image Credits"]) score += 1;
    if (fields["Sound Links"]) score += 1;
    if (fields["Sound Credits"]) score += 1;
    
    return score;
  }, []);

  const { positions, groups, scales, colors } = useMemo(() => {
   
    const groups = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    // Normalize based on FULL dataset (all cinemas) for consistent scaling
    // This ensures particles maintain their size relationship regardless of filters
    const normalizationData = fullDataForNormalization || originalData || [];
    const allRichnessScores = normalizationData.map(cinema => calculateDataRichness(cinema));
    const minRichness = Math.min(...allRichnessScores);
    const maxRichness = Math.max(...allRichnessScores);
    const richnessRange = maxRichness - minRichness || 1; // Avoid division by zero

    // Calculate richness scores for the current (filtered) data
    const richnessScores = originalData.map(cinema => calculateDataRichness(cinema));

    // Simple seeded random function
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 1000;
      return x - Math.floor(x);
    };

    // Minimum distance between particles (in world units)
    // Increased to ensure particles don't touch, accounting for max particle size
    const minDistance = .0; // Minimum spacing between particle centers
    const placedPositions = []; // Track placed positions for collision detection
    
    for (let i = 0; i < count; i++) {
      const cinema = originalData[i];

      groups[i] = groupIndex; // All particles in this system belong to the same group

      // Use cinema ID as seed for consistent random values
      let seed = i;
      if (cinema.id) {
        for (let j = 0; j < cinema.id.length; j++) {
          seed += cinema.id.charCodeAt(j) * (j + 1);
        }
      }
      
      // Check if this cinema is featured
      const isFeatured = featuredCinemas.has(cinema.id);
      
      // Calculate data richness and normalize to scale range
      const richness = richnessScores[i];
      const normalizedRichness = (richness - minRichness) / richnessRange; // 0 to 1
      
      // Map richness to base scale: min 1.0, max 4.0
      // More information = larger particle base
      const baseRichnessScale = 1.0 + (normalizedRichness * 5.0); // Range: 1.0 to 4.0
      
      // Add random multiplier (0.7 to 1.3) using seeded random for consistency
      // This ensures particles have variation while maintaining deterministic results
      const randomMultiplier = 0.7 + (seededRandom(seed + 100) * 0.6); // Range: 0.7 to 1.3
      const baseScale = baseRichnessScale *  randomMultiplier ;
      
      if (isFeatured) {
        scales[i] =  baseScale * 2.0; // Fixed size for featured cinemas (maintains constant size regardless of zoom)
        colors.set([1.0, 0.843, 0.0], i * 3); // Gold color for featured cinemas
      } else {
        scales[i] = baseScale; // Scale = data richness * random multiplier
        colors.set([1.0, 1.0, 1.0], i * 3); // Default color for non-featured cinemas
      }
    
      // Use sqrt distribution for uniform spread across 2D area (not clustered at center)
      // Use seeded random for consistent, deterministic positioning
      // Try multiple times to find a position that doesn't overlap
      let x, y, z = 0;
      let attempts = 0;
      const maxAttempts = 50;
      let validPosition = false;
      
      while (!validPosition && attempts < maxAttempts) {
        const distance = Math.sqrt(seededRandom(seed + 1 + attempts)) * radius;
        const angle = seededRandom(seed + 2 + attempts) * Math.PI * 2; // Full circle in radians
        
        x = distance * Math.cos(angle);
        y = distance * Math.sin(angle) + 10;
        
        // Check if this position is far enough from all previously placed particles
        validPosition = placedPositions.every(placed => {
          const dx = x - placed.x;
          const dy = y - placed.y;
          const distanceToPlaced = Math.sqrt(dx * dx + dy * dy);
          return distanceToPlaced >= minDistance;
        });
        
        attempts++;
      }
      
      // If we couldn't find a valid position after max attempts, use the last attempted position
      // This ensures all particles are placed even if the area is crowded
      placedPositions.push({ x, y });
      
      // add the 3 values to the attribute array for every loop
      positions.set([x, y, z], i * 3);
    }

    return { positions, groups, scales, colors };
  }, [count, groupIndex, originalData, featuredCinemas, radius, calculateDataRichness, fullDataForNormalization]);

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
      { z: 100 },
      { z: 500, duration: 2, ease: "power2.out" }
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
    data: storeData,
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
            fullDataForNormalization={fullData || storeData}
            count={filteredData.length}
            groupType="all"
            groupIndex={7}
        
          />
        </>
      )}

      <OrbitControls
        enableRotate={false}
        panSpeed={1.2}
        maxDistance={800}
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
