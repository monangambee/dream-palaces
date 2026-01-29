"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "../utils/useStore";
import Link from "next/link";
import { count } from "d3";
// import motion from "framer-motion";


const Hero = ({ fullData }) => {
  const [allUrls, setAllUrls] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const images = [
    {
      name: "Africa Film Society",
      url: "/images/Accra Africa Film Society.jpg",
      credit: "Courtesy of Africa Film Society, 2022. ",
      country: "Accra, Ghana",
    },
    {
      name: "Ciné Sanyon",
      url: "/images/BF_Bobo-Dioulasso_Sanyon_1.png",
      credit: "",
      country: "Bobo-Dioulasso, Burkina Faso",
    },
    {
      name: "Awa Cinema",
      url: "/images/Dakar Awa 2.jpg",
      credit: "© Mamadou Dia, 2016. (Still from Samedi Cinema)",
      country: "Dakar, Senegal",
    },
    {
      // url: "/images/Durban Lyric 1.png",
      // credit: ""
    },
    {
      name: "Eyethu Cinema",
      url: "/images/Eyethu Johannesburg 4.jpg",
      credit: "Courtesy of Johannesburg In Your Pocket, 2025. ",
      country: "Johannesburg, South Africa",
    },
    {
      name: "DeLuxe Theatre",
      url: "/images/Houston DeLuxe.jpg",
      credit: "©️ Hickey-Robertson, N.d. Courtesy of Menil Archives",
      country: "Houston, TX, USA",
    },
    {
      name: "Crenshaw Dairy Mart",
      url: "/images/Inglewood Crenshaw Dairy Mart.png",
      credit: "",
      country: "Los Angeles, USA",
    },
    {
      name: "King's Cinema",
      url: "/images/Johannesburg King's 2 (1).jpg",
      credit: "",
      country: "Johannesburg, South Africa",
    },
    {
      name: "Arewa Cinemas",
      url: "/images/Kaduna Arewa Cinemas.jpg",
      credit: "",
      country: "Kaduna, Nigeria",
    },
    {
      name: "Casino Cinema",
      url: "/images/Lagos Casino Cinema (2).jpg",
      credit: "©  Tajudeen Sowole, 2021",
      country: "Lagos, Nigeria",
    },
    {
      name: "Rex Cinema",
      url: "/images/Lagos Rex Cinema.jpg",
      credit:
        "© Duckworth, E.H. 1930-1972. Courtesy of Melville J. Herskovits Library of African Studies of Northwestern University Libraries. ",
      country: "Lagos, Nigeria",
    },
    {
      name: "Ciné Burkina",
      url: "/images/Ouagadougou Burkina.jpg",
      credit: "KONATEYaya226, CC0, via Wikimedia Commons",
      country: "Ouagadougou, Burkina Faso",
    },
    {
      name: "Vog Cinema",
      url: "/images/RC_ Brazzaville_Vog_2.jpg",
      credit: "© Days Before the Cineplex, 2016.",
      country: "Brazzaville, Republic of the Congo",
    },
    {
      name: "Anzier Theatre",
      url: "/images/Seattle WA Anzier.jpg",
      credit:
        "Birdland, 2203 E Madison Street, Seattle, ca. 1955. Image courtesy of UW Special Collections. ",
      country: "Seattle, USA",
    },
    {
      name: "80 Drive-In | Lincoln Theater",
      url: "/images/Tuskegee Drive-In USA.jpg",
      credit: "© Glen Wills, Forgotten Alabama, 2024",
      country: "Tuskegee, USA",
    },
    {
      name: "DeLuxe Theatre",
      url: "/images/USA TX DeLuxe 3.jpg",
      credit: "©️ Hickey-Robertson, N.d. Courtesy of Menil Archives. ",
      country: "Houston, TX, USA",
    },
    {
      name: "Abbia Cinema",
      url: "/images/Yaoundé Abbia 2.jpg",
      credit: "",
      country: "Yaoundé, Cameroon",
    },
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

    setAllUrls(images);

    // Random selection
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 3);

    setImageUrls(selectedImages);
    // console.log('Selected URLs:', selectedUrls.length);
  }, [fullData]);

  const handleShuffle = () => {
    if (allUrls.length === 0) return;
    const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 3);
    setImageUrls(selectedImages);
  };

  const getRandomPosition = (index) => {
    const seed = index * 1439;
    const randomOffset = ((seed * 9301 + 49297) % 233280) / 233280;

    const positions = [
      {
        top: `${randomOffset * 10}%`,
        left: "50%",
        transform: "translateX(-50%)",
      },
      {
        bottom: `${randomOffset * 10}%`,
        left: "50%",
        transform: "translateX(-50%)",
      },
      {
        top: "50%",
        left: `${randomOffset * 20 - 5}%`,
        transform: "translateY(-50%)",
      },
      {
        top: "50%",
        right: `${randomOffset * 20 - 5}%`,
        transform: "translateY(-50%)",
      },
    ];

    return positions[index % 4];
  };

  return (
    <div className="relative flex-nowrap  max-w-screen w-[100%] md:w-[80%] min-h-[50vh] xl:h-full flex flex-row items-start justify-center px-4">
      <button
        onClick={handleShuffle}
        className="font-frontage border-[0.5px] text-xs z-10 flex items-center px-4 sm:px-8 py-3 sm:py-4 md:hover:bg-homeAccent md:hover:text-black active:bg-homeAccent active:text-black min-h-[44px] order-last sm:order-none absolute bottom-5 sm:bottom-[10%] sm:left-1/2 sm:-translate-x-1/2 mt-4 sm:mt-0"
      >
        <Image
          src={"/icons/shuffle.png"}
          width={36}
          height={36}
          alt="shuffle icon"
          className="invert"
        />
        {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"/></svg> */}
      </button>
      {/* <div className="grid  grid-cols-2 gap-4  p-4  sm:w-full sm:h-full min-h-screen"> */}

      {imageUrls.map((image, index) => {
        if (!image.url) return null;
        const position = getRandomPosition(index);
        return (
          <div
            key={index}
            className="group relative h-[200px] z-10 sm:h-[350px] w-[350px] hover:w-[500px] transition-all duration-300 ease-in-out mx-auto"
            // style={!isMobile ? position : {}}
          >
            <Image
  
              src={image.url}
              alt={`Cinema ${index}`}
              
              fill
              sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, (max-width: 1024px) 120px, (max-width: 1280px) 180px, 300px"
              className=" border-primary border-[0.5px] p-2  object-cover"
            />

            <div className="pointer-events-none absolute z-10 inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100">
              <div className="absolute bottom-2 left-0 right-0 p-3 text-white text-xs sm:text-sm space-y-1">
                {image.name ? (
                  <p className="font-semibold">{image.name}</p>
                ) : null}
                {image.country ? (
                  <p className="text-[10px] uppercase tracking-wide">
                    {image.country}
                  </p>
                ) : null}
                {image.credit ? (
                  <p className="text-[8px] leading-snug opacity-80">
                    {image.credit}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      {/* </div> */}
    </div>
  );
};

export default Hero;
