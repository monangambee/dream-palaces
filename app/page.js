import { fetchAirtableDataProgressive } from "./utils/data";
import { AIRTABLE_CONFIG } from "./config/airtable";
import { getFirstFilmSlug } from "./utils/vimeo";
import Constellation from "./components/Constellation";
import Link from "next/link";
import Image from "next/image";
import Hero from "./components/Hero";
import About from "./components/about";
import { Suspense } from "react";

// Enable static generation with revalidation
// export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Server-side data fetching
  let fullData = [];
  let error = null;

  try {
    if (process.env.NODE_ENV ==! "development") {
      fullData = [];
    } else {
      fullData = await fetchAirtableDataProgressive(
        AIRTABLE_CONFIG.defaultTable,
      );
    }
  } catch (err) {
    console.error("Error fetching Airtable data:", err);
    error = err.message;
  }

  const { slug: firstFilmSlug, thumbnail: screeningGif } =
    await getFirstFilmSlug();

  const modes = [
    {
      name: "CONSTELLATION",
      description:
        "Explore a constellation of over 1000 cinemas, each representing a unique story and history. Click on individual cinemas to uncover their narratives.",
      link: "/constellation",
      image: "/constellation.gif",
      accentColor: "#FFD700",
    },
    {
      name: "MAP",
      description:
        "Navigate a map showcasing the geographical distribution of cinemas across Africa and the diaspora. Zoom in to discover detailed information about each location.",
      link: "/map",
      image: "/map.webp",
      accentColor: "#007bff", //blue
    },
    {
      name: "SCREENING ROOM",
      description:
        "Use your mobile device to experience movies from a virtual screening room.",
      link: `/screening/${firstFilmSlug || ""}`,
      image: screeningGif,
      accentColor: "#C4B0EC",
    },
  ];

  return (
    <Suspense>
      <div className="w-screen flex flex-col items-center relative bg-background overflow-hidden">
        <div className="lg:w-[100%] w-full h-full flex text-primary flex-col justify-start items-center bg-background relative bg-contain sm:p-4 sm:pt-32">
          {/* Add this gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-100 pointer-events-none"></div> */}
          {/* <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div> */}
          <div className=" flex flex-col gap-8 absolute inset-0 z-0 w-screen h-screen top-0 left-0">
            {/* <HomeScene /> */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/stars.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center p-2 sm:p-4 relative gap-4">
            <Hero fullData={fullData} />

            {/* <h1 className="text-[5rem] font-sansation border-b-[0.5px]">
          {" "}
          WELCOME TO DREAM PALACES
        </h1> */}

           
          </div>
          <div className=" px-2 sm:px-12 ">
                    <About />
             </div>
        

        </div>

        <div className="w-[100%] bg-background font-avenir flex  flex-col   md:p-16 items-center justify-center">
          <p className=" text-white mt-9  uppercase font-bold text-sm">
            [ Choose your experience ]
          </p>

          <div className="flex flex-col gap-4 sm:gap-8 w-[100%] sm:w-[100%] items-between justify-start px-2 py-8">
            {modes.map((mode, index) => (
              <Link key={index} href={mode.link}>
                <div
                  className="w-full min-h-[12vh] sm:h-[10vh] flex items-center justify-center font-frontage relative border-[0.5px] p-6 sm:p-8 transition-all duration-200 ease-in-out md:hover:border-[var(--accent-color)] active:border-[var(--accent-color)] group"
                  style={{ "--accent-color": mode.accentColor }}
                >
                  <p className="font-bold text-primary text-sm sm:text-sm xl:text-base">
                    {mode.name}
                  </p>
                  {mode.image && (
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[250px] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <img
                        src={mode.image}
                        alt={mode.name}
                        className="w-full h-auto border border-primary rounded"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
