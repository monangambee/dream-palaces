/**
 * Hero – Cinema Photo Carousel
 *
 * Displays three randomly-chosen cinema photographs on the home page.
 * Images are drawn from a hand-curated static list (not the API) so that
 * each entry has proper credits and a descriptive label.
 *
 * The "Shuffle" button re-randomises the selection.
 *
 * NOTE: All filenames use ASCII-only characters to avoid Unicode
 * normalisation mismatches between macOS (NFC) and Linux (byte-exact).
 */
"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useStore } from "../utils/useStore"
import Link from "next/link"
import { count } from "d3"

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

  // ── Curated cinema photographs ─────────────────────────────
  // Each entry maps to a file in /public/images.
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
      url: "/images/YaoundeAbbia2.jpg",
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

    // Pick 3 random images from the curated list on mount
    const validImages = images.filter((img) => img.url)
    setAllUrls(validImages)

    const shuffled = [...validImages].sort(() => 0.5 - Math.random())
    const selectedImages = shuffled.slice(0, 3)

    setImageUrls(selectedImages);
    // console.log('Selected URLs:', selectedUrls.length);
  }, [fullData]);

  /** Re-shuffle: pick a new random set of 3 images */
  const handleShuffle = () => {
    if (allUrls.length === 0) return;
    const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 3);
    setImageUrls(selectedImages);
  };

  /**
   * Deterministic pseudo-random offset per image slot.
   * Keeps layout stable across re-renders while still looking organic.
   */
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
    <div className="w-full sm:w-[80%] flex flex-col justify-center items-center h-full px-2 pt-4 sm:px-4 2xl:gap-8 gap-8 md:pt-16 2xl:px-4">
      <div className="relative  w-[100%] h-[150px] sm:h-[300px]  2xl:h-[400px] flex flex-row gap-2 items-start justify-center">
        {/* <div className="grid  grid-cols-2 gap-4  p-4  sm:w-full sm:h-full min-h-screen"> */}
        {imageUrls.map((image, index) => {
          if (!image.url) return null;
          const position = getRandomPosition(index);
          return (
            <div
              key={index}
              className="group relative flex-1  max-w-[30vw]   hover:flex-[1.5] h-full transition-all duration-300 ease-in-out mx-auto"
              // style={!isMobile ? position : {}}
            >
              <Image
                src={image.url}
                alt={`Cinema ${index}`}
                fill
                sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, (max-width: 1024px) 120px, (max-width: 1280px) 180px, 300px"
                className=" border-primary border-[0.5px] p-2  object-cover"
              />

              <div className="font-avenir pointer-events-none absolute z-10 inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100">
                <div className="absolute bottom-2 left-0 right-0 p-3 text-primary text-[6px] sm:text-sm space-y-1">
                  {image.name ? (
                    <p className="font-semibold">{image.name}</p>
                  ) : null}
                  {image.country ? (
                    <p className="text-[6px] sm:text-[10px] uppercase tracking-wide">
                      {image.country}
                    </p>
                  ) : null}
                  {image.credit ? (
                    <p className="text-[6px] sm:text-[8px] leading-snug opacity-80">
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

      <button
        onClick={handleShuffle}
        className="group font-frontage border-[0.5px] text-xs z-10 flex items-center justify-center p-3 px-8 hover:bg-primary md:hover:text-black active:text-black min-h-[44px] order-last sm:order-none sm:mt-0"
      >
        {/* <Image
          src={"/icons/shuffle.svg"}
          width={36}
          height={36}
          alt="shuffle icon"
          className=""
        /> */}
        <svg
          // width="32px"
          // height="32px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4  sm:w-8 sm:h-8"
        >
          <g id="Media / Shuffle">
            <path
              id="Vector"
              d="M18 20L21 17M21 17L18 14M21 17H17C14.2386 17 12 14.7614 12 12C12 9.23858 9.76142 7 7 7H3M18 4L21 7M21 7L18 10M21 7L17 7C15.8744 7 14.8357 7.37194 14 7.99963M3 17H7C8.12561 17 9.16434 16.6277 10 16"
              stroke="#FDF9ED"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="md:group-hover:stroke-black active:stroke-primary transition-colors duration-300"
            />
          </g>
        </svg>
      </button>
    </div>
  );
};

export default Hero;
