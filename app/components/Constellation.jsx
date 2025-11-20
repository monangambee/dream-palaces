'use client';

import { Canvas, events } from "@react-three/fiber";
import dynamic from 'next/dynamic';
import { use, useEffect, useState } from 'react';
import { AdaptiveDpr, Bvh } from "@react-three/drei";
import * as THREE from 'three'
import { useStore } from "../../src/utils/useStore";
import tunnel from "tunnel-rat";


// Dynamically import components that use React hooks to avoid SSR issues
const Scene = dynamic(() => import('../../src/scene'), { ssr: false });
const Filter = dynamic(() => import('../../src/components/filter'), { ssr: false });
const CinemaInfo = dynamic(() => import('../../src/components/CinemaInfo'), { ssr: false });



export default function Constellation({fullData}) {
  const t = tunnel();

  // const {fullData} =useStore();

  const {setData} = useStore();
  
  const [cachedData, setCachedData] = useState(null);

  useEffect(() => {

    setData(fullData);

    // Cache data for development use
    if (fullData && fullData.length > 0) {
      const cacheData = {
        fullData,
        timestamp: Date.now()
      };
      localStorage.setItem('airtable-cache', JSON.stringify(cacheData));
      console.log('Cached data for development use');
      setCachedData(fullData);
    } else {
      // Try to get cached data from localStorage in development
      const cached = localStorage.getItem('airtable-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedData(parsed.fullData || []);
        console.log('Using cached data from localStorage');
      }
    }
  }, [fullData]);

  return (
    <div className="w-full h-screen min-h-screen flex flex-row overflow-hidden relative">
   
      <Filter />
      
   
      <Canvas 
        className="canvas w-full h-full z-10"
        camera={{ position: [0, 0, 50], fov: 75, }}
        // events={eventManagerFactory}
      >
        <AdaptiveDpr pixelated />
        <Bvh firstHitOnly>

        <Scene 
          fullData={cachedData || fullData}
          useApiForFullData={false}
        />
        </Bvh>

      </Canvas>
      
   
        <CinemaInfo />
    
    </div>
  );
}
