'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { useStore } from '../../src/utils/useStore';

const Hero = ({ fullData }) => {

      const [cachedData, setCachedData] = useState(null);

      const imageUrls = useStore((state) => state.imageUrls);
      const setImageUrls = useStore((state) => state.setImageUrls);

    //  const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
    let dataSource = fullData;

    // Handle caching and fallback
    if (fullData?.length > 0) {
      // Cache fresh data
      localStorage.setItem('airtable-cache', JSON.stringify({
        fullData,
        timestamp: Date.now()
      }));
      console.log('Cached fresh data');
    } else {
      // Use cached data when no fresh data
      try {
        const cached = localStorage.getItem('airtable-cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          dataSource = parsed.fullData || [];
          console.log('Using cached data');
        }
      } catch (error) {
        console.warn('Cache read failed:', error);
      }
    }

    if (!dataSource?.length) return;

    // Process images
    const urls = dataSource
      .filter(cinema => cinema.fields?.Images?.length > 0)
      .map(cinema => cinema.fields.Images[0].url)
      .filter(Boolean); // Remove any falsy URLs

    // Random selection
    const shuffled = [...urls].sort(() => 0.5 - Math.random());
    const selectedUrls = shuffled.slice(0, 5);

    setImageUrls(selectedUrls);
    // console.log('Selected URLs:', selectedUrls.length);
  }, [fullData])


    // Function to generate consistent random position based on index
  const getRandomPosition = (index) => {
    const seed = index * 1439; // Use index as seed for consistent positioning
    const randomX = (seed * 9301 + 49297) % 233280 / 233280; // Pseudo-random 0-1
    const randomY = (seed * 7919 + 12345) % 233280 / 233280; // Different calculation for Y
    
    return {
      left: `${randomX * 100 -5}%`, // 10-90% from left
      top: `${randomY * 80+ 10}%`   // 10-90% from top
    };
  };
  



  return (
    <>
      {imageUrls.map((url, index) => {
        const position = getRandomPosition(index);
        return (
          <Image key={index} src={url} alt={`Cinema ${index}`}  width={200} height={200} 
          // loader={<div className='h-full w-full bg-slate-400'></div>} 
          style={{
            left: position.left,
            top: position.top,
            transform: 'translate(-50%, -50%)',
            // zIndex: index + 1, // Ensure proper stacking
          }}
          className={`p-8 aspect-square object-cover absolute border-primary border-[0.5px] left-[${position.left}] top-[${position.top}]`}/>
        );
      })}
    </>
  )
}

export default Hero