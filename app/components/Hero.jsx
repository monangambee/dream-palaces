"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "../utils/useStore";
import Link from "next/link";

const Hero = ({ fullData }) => {
  const [allUrls, setAllUrls] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

   const urls = [
      "/images/Accra Africa Film Society.jpg",
      "/images/Brazzaville Vog 1.jpg",
      "/images/Cotonou Benin.jpg",
      "/images/Dakar Awa 1.jpg",
      "/images/Garoua Le Ribadou.jpg",
      "/images/Houston DeLuxe.jpg",
      "/images/Johannesburg Eyethu.jpg",
      "/images/Maputo CineAfrica.jpg",
      "/images/Ouagadougou Burkina.jpg",
      "/images/Seattle WA Anzier.jpg",
      "/images/WhatsApp Image Aug 15 2025.jpeg",
      "/images/Yaoundé Abbia 1.jpg",
    ];

  useEffect(() => {
    // let dataSource = fullData;

    // // Handle caching and fallback
    // if (fullData?.length > 0) {
    //   // Cache fresh data
    //   localStorage.setItem(
    //     "airtable-cache",
    //     JSON.stringify({
    //       fullData,
    //       timestamp: Date.now(),
    //     })
    //   );
    //   console.log("Cached fresh data");
    // } else {
    //   // Use cached data when no fresh data
    //   try {
    //     const cached = localStorage.getItem("airtable-cache");
    //     if (cached) {
    //       const parsed = JSON.parse(cached);
    //       dataSource = parsed.fullData || [];
    //       console.log("Using cached data");
    //     }
    //   } catch (error) {
    //     console.warn("Cache read failed:", error);
    //   }
    // }

    // if (!dataSource?.length) return;

  

    // Process images
    // const urls = dataSource
    //   .filter(cinema => cinema.fields?.Images?.length > 0)
    //   .map(cinema => cinema.fields.Images[0].url)
    //   .filter(Boolean); // Remove any falsy URLs

    setAllUrls(urls);

    // Random selection
    const shuffled = [...urls].sort(() => 0.5 - Math.random());
    const selectedUrls = shuffled.slice(0, 4);

    setImageUrls(selectedUrls);
    // console.log('Selected URLs:', selectedUrls.length);
  }, [fullData]);

  const handleShuffle = () => {
    if (allUrls.length === 0) return;
    const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
    const selectedUrls = shuffled.slice(0, 4);
    setImageUrls(selectedUrls);
  };

  const getRandomPosition = (index) => {
    const seed = index * 1439;
    const randomOffset = (seed * 9301 + 49297) % 233280 / 233280;
    
    const positions = [
      { top: `${randomOffset * 10 }%`, left: '50%', transform: 'translateX(-50%)' },
      { bottom: `${randomOffset * 10 }%`, left: '50%', transform: 'translateX(-50%)' },
      { top: '50%', left: `${randomOffset * 20 - 10 }%`, transform: 'translateY(-50%)' },
      { top: '50%', right: `${randomOffset * 20 - 5 }%`, transform: 'translateY(-50%)' },
    ];
    
    return positions[index % 4];
  };

  return (
    <div className="relative max-w-screen w-full min-h-[50vh] sm:min-h-screen xl:max-h-[80vh] flex flex-col items-center justify-center px-4">
      <button
        onClick={handleShuffle}
        className="font-frontage border-[0.5px] text-xs z-10 flex items-center px-4 sm:px-8 py-3 sm:py-4 md:hover:bg-yellow-400 md:hover:text-black active:bg-yellow-400 active:text-black min-h-[44px] order-last sm:order-none sm:absolute sm:bottom-[50%] sm:left-1/2 sm:-translate-x-1/2 mt-4 sm:mt-0"
      >
       <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"/></svg>
      </button>
      {/* <div className="grid  grid-cols-2 gap-4  p-4  sm:w-full sm:h-full min-h-screen"> */}

      {imageUrls.map((url, index) => {
        const position = getRandomPosition(index);
        return (
          <div
            key={index}
            className="relative h-[200px] w-full max-w-[300px] sm:absolute sm:w-[30%] sm:h-[30%] sm:max-w-none"
            style={!isMobile ? position : {}}
          >
            <Image
              // unoptimized
              src={url}
              alt={`Cinema ${index}`}
              fill
              sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, (max-width: 1024px) 120px, (max-width: 1280px) 180px, 300px"
              className=" border-primary border-[0.5px] p-4 object-contain aspect-square"
            />
          </div>
          
        );
      })}
      {/* </div> */}

    </div>
  );
};

export default Hero;
