import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  use,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import lineFragment from "./shaders/lineFragment.glsl";
import { analyzeAirtableData } from "./utils/d3Analysis";
import { useStore } from "./utils/useStore";
import { seededRandom } from "three/src/math/MathUtils.js";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import tunnel from "tunnel-rat";

gsap.registerPlugin(useGSAP);

// const ConstellationBackground = () => {
//   const radii = [
//     1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
//     95, 100,
//   ];
//   const radialSegments = 16;
//   const radialLength = 100;

//   // Create circle geometries
//   const circleGeometries = useMemo(() => {
//     return radii.map((radius) => {
//       const segments = 128;
//       const geometry = new THREE.BufferGeometry();
//       const vertices = [];
//       for (let i = 0; i <= segments; i++) {
//         const theta = (i / segments) * Math.PI * 2;
//         vertices.push(Math.cos(theta) * radius, Math.sin(theta) * radius, 0);
//       }
//       geometry.setAttribute(
//         "position",
//         new THREE.Float32BufferAttribute(vertices, 3)
//       );
//       return geometry;
//     });
//   }, []);

//   // Create radial line geometries
//   const radialGeometries = useMemo(() => {
//     return Array.from({ length: radialSegments }, (_, i) => {
//       const theta = (i / radialSegments) * Math.PI * 2;
//       const x = Math.cos(theta) * radialLength;
//       const y = Math.sin(theta) * radialLength;

//       return new THREE.BufferGeometry().setFromPoints([
//         new THREE.Vector3(0, 0, 0),
//         new THREE.Vector3(x, y, 0),
//       ]);
//     });
//   }, []);

//   return (
//     <group>
//       {circleGeometries.map((geometry, index) => (
//         <line key={`circle-${index}`} geometry={geometry}>
//           <lineBasicMaterial color={0x444466} transparent opacity={0.6} />
//         </line>
//       ))}

//       {radialGeometries.map((geometry, index) => (
//         <line key={`radial-${index}`} geometry={geometry}>
//           <lineBasicMaterial color={0x444466} transparent opacity={0.4} />
//         </line>
//       ))}
//     </group>
//   );
// };

const CustomGeometryParticles = ({ data, count, originalData, groupIndex }) => {

  
  const points = useRef();
  const particlesRef = useRef();

  useThree((state) => {
    state.raycaster.params.Points.threshold = 5; // Much more precise - only detect when actually close to particles

    state.raycaster.near = 0; // start checking just in front of the camera
    // state.raycaster.far = 150;
  });

  const { filters, setSelectedCinema, setAnimateParticles } = useStore();

  const animateParticles = useCallback(() => {

    gsap.fromTo(
      points.current.material.uniforms.uPosition,
      { value: 0.0 },
      {
        value: 8.0,
        duration: 3,
        ease:"sine.inOut",
      }
    );
  }, []);

  useEffect(() => {
    setAnimateParticles(animateParticles);
  }, [setAnimateParticles]);

  // const [hoveredIndex, setHoveredIndex] = useState(null);

  // const handlePointerOut = (event) => {
  //   if (event.object === points.current) {
  //     const pointIndex = event.index;
  //     setHoveredIndex(null);

  //     // Scale back down only this specific particle
  //     gsap.to(scales, {
  //       [pointIndex]: 1.0, // Original scale
  //       duration: 0.3,
  //       ease: "power2.out",
  //       onUpdate: () => {
  //         points.current.geometry.attributes.aScale.needsUpdate = true;
  //       }
  //     });
  //   }
  // };

  // const handlePointerOver = () => {
  //   gsap.to(points.current.material.uniforms.uSize, {
  //     value: 20.0,
  //     duration: 0.3,
  //     ease: "power2.out"
  //   });
  // };

  // const handlePointerOut = () => {
  //   gsap.to(points.current.material.uniforms.uSize, {
  //     value: 8.0,
  //     duration: 0.3,
  //     ease: "power2.out"
  //   });
  // };

  // Handle click on particles
  const handleClick = (e) => {
    e.stopPropagation();
    
    // Get ALL intersections and sort by distance (closest first)
    const intersections = e.intersections || [e];
    
    // Sort intersections by distance (closest to camera first)
    intersections.sort((a, b) => a.distance - b.distance);
    
    // Look for the closest intersection that's actually clickable
    let selectedIntersection = null;
    
    // First, try to find a featured cinema among the closest intersections
    const closeThreshold = intersections[0]?.distance + 2; // Allow small distance variation
    const closeIntersections = intersections.filter(int => int.distance <= closeThreshold);
    
    // Among close intersections, prefer featured cinemas
    for (const intersection of closeIntersections) {
      const pointIndex = intersection.index;
      const cinema = originalData[pointIndex];
      const isFeatured = featuredCinemas.has(cinema.id);
      
      if (isFeatured) {
        selectedIntersection = intersection;
        break;
      }
    }
    
    // If no featured cinema found among close intersections, use the closest one
    if (!selectedIntersection) {
      selectedIntersection = intersections[0];
    }
    
    if (selectedIntersection) {
      const pointIndex = selectedIntersection.index;
      const cinema = originalData[pointIndex];
      
      if (cinema && cinema.id) {
        setSelectedCinema(cinema);
      }
    }
  };

  const uniforms = useMemo(() => {
    return {
      uTime: {
        value: 0.0,
      },
      uSize: {
        value: 10.0,
      },
      uPosition: {
        value: 0.0,
      },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uDevicePixelRatio: { value: window.devicePixelRatio }
    };
  }, []);

  const radius = 70; // Much larger radius for better spread

  // const count = 100;
  //  const count = data.length
  const countryColorMap = useMemo(() => {
    const countries = new Set();
    originalData.forEach((cinema) => {
      countries.add(cinema.fields?.Country || "Unknown");
    });

    // Convert to array and create color map
    const countryArray = Array.from(countries);
    // console.log("Countries in data:", countryArray);
    // console.log("Total countries:", countryArray.length);

    // Define your color palette
    const colorPalette = [
      [0.53, 0.81, 0.92], // Blue
      [0.0, 1.0, 0.0], // Green
      [1.0, 0.0, 0.0], // Red

      [1.0, 1.0, 0.0], // Yellow
      [1.0, 0.0, 1.0], // Magenta
      [0.0, 1.0, 1.0], // Cyan
      [1.0, 0.5, 0.0], // Orange
      [0.5, 0.0, 1.0], // Purple
      [1.0, 0.0, 0.5], // Pink
      [0.5, 1.0, 0.0], // Lime
      [0.0, 0.5, 1.0], // Sky blue
      [1.0, 0.8, 0.0], // Gold
      [0.8, 0.0, 0.8], // Dark magenta
      [0.0, 0.8, 0.8], // Teal
      [0.8, 0.5, 0.0], // Brown-orange
      [0.5, 0.8, 0.0], // Yellow-green
      [0.0, 0.8, 0.5], // Sea green
      [0.8, 0.0, 0.5], // Deep pink
      [0.5, 0.0, 0.8], // Indigo
      [0.6, 0.6, 0.6], // Gray
    ];

    // Dynamically create country color map
    const colorMap = {};
    countryArray.forEach((country, index) => {
      colorMap[country] = colorPalette[index % colorPalette.length];
    });

    return colorMap;
  }, [originalData]);

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
      const fields = cinema.fields;
      const country = fields?.Country || "Unknown";

      // Get color from the dynamic map
      const [r, g, b] = countryColorMap[country] || [0.5, 0.5, 0.5];
      colors.set([r, g, b], i * 3);

      groups[i] = groupIndex; // All particles in this system belong to the same group

      // Use cinema ID as seed for consistent random values
      const seed = cinema.id ? cinema.id.charCodeAt(0) + i : i;
      
      // Check if this cinema is featured using the same method as featuredCinemas Set
      const isFeatured = featuredCinemas.has(cinema.id);
      
      if (isFeatured) {
        scales[i] = 5.0; // Large scale for featured cinemas
        colors.set([1.0, 0.84, 0.0], i * 3); // Gold color for featured cinemas
      } else {
        scales[i] = seededRandom(seed + 4) * 1.5 + 1.0; // Random scale for non-featured cinemas (1.0 to 2.5)
        colors.set([1.0,1.0,1.0], i * 3); // Default color for non-featured cinemas
      }
    
      // Use simple random positioning (vertex shader will add Perlin noise)
      const distance = Math.sqrt(seededRandom(seed + 1)) * radius;
      const theta = seededRandom(seed + 2) * 360;
      const phi = seededRandom(seed + 3) * 360;

      let x = distance * Math.sin(theta) * Math.cos(phi);
      let y = distance * Math.sin(theta) * Math.sin(phi) + 10;
      let z = 0;

      // add the 3 values to the attribute array for every loop
      positions.set([x, y, z], i * 3);
    }

    return { positions, groups, scales, colors };
  }, [count, groupIndex, originalData, featuredCinemas]);

  useFrame((state) => {
    const { clock } = state;
    const gl = state.gl;
    gl.setClearColor('#000000ff', 1);



  

    // gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    

    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;

    points.current.material.uniforms.uTime.value = clock.elapsedTime;
    points.current.material.uniforms.uDevicePixelRatio.value = window.devicePixelRatio 

  });

  const lineGeometry = useMemo(() => {
    // const lineColors = [];
    // const linePositions = [];
    // // const maxDistance = 5.0;

    // for (let i = 0; i < count - 1; i++) {
    //   const x = positions[i * 3];
    //   const y = positions[i * 3 + 1];
    //   const z = positions[i * 3 + 2];

    //   // const x2 = positions[(i + 1) * 3];
    //   // const y2 = positions[(i + 1) * 3 + 1];
    //   // const z2 = positions[(i + 1) * 3 + 2];

    //   linePositions.push(x, y, z);
    // }

    return new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
  }, [positions, count]);

  const { camera } = useThree();

  useGSAP(() => {
    if (!points.current) return; // don’t animate yet if geometry isn’t ready

    gsap.fromTo(
      camera.position,
      { z: 10 },
      { z: 70, duration: 4, ease: "power2.out" }
    );
    // return null;
  }, [points.current]);

  // useLayoutEffect(() => {
  //   setAnimateParticles(animateParticles);
  // }, [animateParticles, setAnimateParticles])

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
        className="cursor-pointer"
        // setIndex={null}
        // onClick={() => handleClickRef.current}

        // onPointerEnter={handlePointerOver}
        // onPointerLeave={handlePointerOut}
        // onPointerOver={handlePointerOver}
        // onPointerOut={handlePointerOut}
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
      console.log(
        "📊 Initializing with full data from server:",
        fullData.length,
        "records"
      );

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

  // useEffect(() => {
  //   if (airtableData) {
  //     const initialFilters = {};

  //     Object.keys(airtableData).forEach((field) => {
  //       initialFilters[field] = "all";
  //     });
  //     setFilters(initialFilters);
  //   }
  // }, [airtableData]);

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  useFrame(({ gl, scene, camera }) => {
    // console.log(camera.position.z)
    // gl.setClearColor(0x000000, 1);
    // if (planeRef.current) {
    //   planeRef.current.scale.set(window.innerWidth, window.innerHeight, 1);
    // }
  });

  const planeRef = useRef();

  return (
    <>
      {/* <OrthographicCamera
          near={0.1}
          far={1000}
          makeDefault
          position={[0, 0, 10]}
          left={sizes.width / -2}
          right={sizes.width / 2}
          top={sizes.height / 2}
          bottom={sizes.height / -2}
        /> */}
      <ambientLight intensity={1} />

      {/* <ConstellationBackground /> */}

      {filteredData && (
        <>
          <CustomGeometryParticles
            data={filteredData}
            originalData={filteredData}
            count={filteredData.length}
            groupType="all"
            groupIndex={7}
            // offset={{ x: 0, y: 0, z: 0 }}

            // setAnimateParticles={setAnimateParticles}
          />
        </>
      )}

      <OrbitControls
        enableRotate={false}
        maxDistance={70}
        minDistance={10}
        // minZoom={10}
      />
    </>
  );
}
