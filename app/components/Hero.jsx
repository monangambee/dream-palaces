"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "../utils/useStore";
import Link from "next/link";

const Hero = ({ fullData }) => {
  // const [cachedData, setCachedData] = useState(null);
  const [allUrls, setAllUrls] = useState([]);

  // const imageUrls = useStore((state) => state.imageUrls);
  // const setImageUrls = useStore((state) => state.setImageUrls);

   const [imageUrls, setImageUrls] = useState([]);

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

  // Function to generate consistent random position based on index
  // const getRandomPosition = (index) => {
  //   const seed = index * 1439; // Use index as seed for consistent positioning
  //   const randomX = (seed * 9301 + 49297) % 233280 / 233280; // Pseudo-random 0-1
  //   const randomY = (seed * 7919 + 12345) % 233280 / 233280; // Different calculation for Y

  //   return {
  //     left: `${randomX * 100 -5}%`, // 10-90% from left
  //     top: `${randomY * 80+ 10}%`   // 10-90% from top
  //   };
  // };

  const positions = [
    "top-8 left-1/2 -translate-x-1/2", // Top center with gap
    "bottom-8 left-1/2 -translate-x-1/2", // Bottom center with gap
    "left-8 top-1/2 -translate-y-1/2", // Left center with gap
    "right-8 top-1/2 -translate-y-1/2", // Right center with gap
  ];

  return (
    <div className="relative w-full h-full min-h-[80vh] flex items-center justify-center">
      <button
        onClick={handleShuffle}
        className="font-frontage border-[0.5px]  flex items-center px-8 py-4 hover:bg-yellow-400 hover:text-black"
      >
        Shuffle
      </button>
      {imageUrls.map((url, index) => {
        return (
          <div
            key={index}
            className={`absolute ${positions[index]} w-[100px] h-[100px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[180px] lg:h-[180px] xl:w-[250px] xl:h-[250px]`}
          >
            <Image
              // unoptimized
              src={url}
              alt={`Cinema ${index}`}
              fill
              sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, (max-width: 1024px) 120px, (max-width: 1280px) 180px, 300px"
              className="object-cover border-primary border-[0.5px] p-4"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Hero;
