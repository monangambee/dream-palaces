/**
 * Constellation – Three.js Canvas Wrapper
 *
 * Three-tier data loading strategy:
 *  1. Server-side prop (fullData) passed from the page component
 *  2. localStorage cache (avoids a network round-trip on repeat visits)
 *  3. Client-side /api/airtable fetch as last resort
 *
 * Once data is available, it's pushed into the Zustand store and
 * rendered through <Scene /> as a particle cloud.
 */
'use client'

import { Canvas } from "@react-three/fiber"
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { AdaptiveDpr, Bvh } from "@react-three/drei"
import { useStore } from "../utils/useStore"

import { Bloom, EffectComposer } from '@react-three/postprocessing'

// Dynamically imported so Three.js never runs during SSR
const Scene = dynamic(() => import('../scene'), { ssr: false })
const Filter = dynamic(() => import('./filter'), { ssr: false })
const CinemaInfo = dynamic(() => import('./CinemaInfo'), { ssr: false })

// ── localStorage helpers for offline-first data caching ──────
const CACHE_KEY = 'airtable-cache'

const saveCache = (data) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ fullData: data, timestamp: Date.now() }));
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached).fullData : null;
  } catch {
    return null;
  }
};

export default function Constellation({ fullData }) {
  const { setData } = useStore();
  const [data, setDataState] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (fullData?.length > 0) {
        saveCache(fullData);
        setDataState(fullData);
        setData(fullData);
        return;
      }

      const cached = getCache();
      if (cached?.length > 0) {
        setDataState(cached);
        setData(cached);
        return;
      }

      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        try {
          const res = await fetch('/api/airtable');
          const { success, data: apiData } = await res.json();
          if (success && apiData?.length > 0) {
            saveCache(apiData);
            setDataState(apiData);
            setData(apiData);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
    };

    loadData();
  }, [fullData, setData]);

  return (
    <div className="w-full h-screen min-h-screen flex flex-row relative">
      <Filter />
      <Canvas 
        className="canvas w-full h-full z-10" 
        camera={{ position: [0, 0, 100], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop="always"
      >
     
        <AdaptiveDpr pixelated />
        <Bvh firstHitOnly>
          <Scene fullData={data || fullData} useApiForFullData={false} />
        </Bvh>

         <EffectComposer>  
        <Bloom luminanceThreshold={1.1} mipmapBlur/>

      </EffectComposer>
      </Canvas>
      <CinemaInfo />
    </div>
  );
}
