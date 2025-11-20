'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame, useThree } from '@react-three/fiber'
import { Preload, useTexture, AdaptiveDpr, Bvh } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useRef, useState, useEffect } from 'react'

import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

// Create geometry and materials outside component to prevent recreation
const SPHERE_GEOMETRY = new THREE.SphereGeometry(2, 64, 64);
const SUN_SPHERICAL = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const SUN_DIRECTION = new THREE.Vector3();

// Create particles once
const createParticles = (starTexture) => {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = 10 * (Math.random() - 0.5);
    positions[i3 + 1] = 10 * (Math.random() - 0.5);
    positions[i3 + 2] = 10 * (Math.random() - 0.5);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: starTexture,
    transparent: true,
    alphaMap: starTexture,
    size: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.001,
  });
  return new THREE.Points(geometry, material);
};

export function EarthScene() {
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const { gl } = useThree();

  // Preload textures with proper caching
  const [day, night, specular, star] = useTexture([
    '/earth/surface5.jpg',
    '/earth/surface5.jpg',
    '/earth/specularClouds.jpg',
    '/earth/star_04.png'
  ]);

  // Configure textures once
  useEffect(() => {
    [day, night, specular].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = gl.capabilities.getMaxAnisotropy();
    });
    specular.wrapS = specular.wrapT = THREE.RepeatWrapping;
  }, [day, night, specular, gl]);

  const [earthParams] = useState({
    atmosphereDayColor: '#000000',
    atmosphereTwilightColor: '#ff6600',
  });

  const clock = useMemo(() => new THREE.Clock(), []);

  // Create materials once and memoize properly
  const earthMaterial = useMemo(() => {
    if (!day || !night || !specular) return null;
    
    return new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uDayTexture: { value: day },
        uNightTexture: { value: night },
        uSpecularCloudsTexture: { value: specular },
        uSunDirection: { value: new THREE.Vector3(0, 0, 1) },
        uAtmosphereDayColor: { value: new THREE.Color(earthParams.atmosphereDayColor) },
        uAtmosphereTwilightColor: { value: new THREE.Color(earthParams.atmosphereTwilightColor) },
        uTime: { value: 0 },
      },
    });
  }, [day, night, specular, earthParams.atmosphereDayColor, earthParams.atmosphereTwilightColor]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uSunDirection: { value: new THREE.Vector3(0, 0, 1) },
        uAtmosphereDayColor: { value: new THREE.Color(earthParams.atmosphereDayColor) },
        uAtmosphereTwilightColor: { value: new THREE.Color(earthParams.atmosphereTwilightColor) },
      },
    });
  }, [earthParams.atmosphereDayColor, earthParams.atmosphereTwilightColor]);

  // Create particles once
  const particles = useMemo(() => {
    if (!star) return null;
    return createParticles(star);
  }, [star]);

  const updateSun = () => {
    SUN_DIRECTION.setFromSpherical(SUN_SPHERICAL);
    if (earthMaterial) {
      earthMaterial.uniforms.uSunDirection.value.copy(SUN_DIRECTION);
    }
    if (atmosphereMaterial) {
      atmosphereMaterial.uniforms.uSunDirection.value.copy(SUN_DIRECTION);
    }
  };

  useEffect(() => {
    if (earthMaterial && atmosphereMaterial) {
      updateSun();
    }
  }, [earthMaterial, atmosphereMaterial]);

  useFrame(() => {
    if (!earthRef.current || !earthMaterial) return;
    
    const elapsed = clock.getElapsedTime();
    earthRef.current.rotation.y = elapsed * 0.1;
    earthMaterial.uniforms.uTime.value = elapsed;
  });

  // Don't render until materials are ready
  if (!earthMaterial || !atmosphereMaterial || !particles) {
    return null;
  }

  return (
    <>
      <mesh ref={earthRef} geometry={SPHERE_GEOMETRY} material={earthMaterial} />
      <mesh ref={atmosphereRef} geometry={SPHERE_GEOMETRY} material={atmosphereMaterial} scale={1.015} />
      <primitive object={particles} />
    </>
  );
}

const HomeScene = () => {
  return (
    <Canvas className='border-[0.5px] h-1/2'>
          <AdaptiveDpr pixelated />
              <Bvh firstHitOnly></Bvh>
      <Suspense fallback={null}>
      <EarthScene />
      {/* <OrbitControls /> */}
      <Preload all />
      </Suspense>
     
    </Canvas>
  );
};

export default HomeScene;