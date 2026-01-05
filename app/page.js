import { fetchAirtableDataProgressive } from "./utils/data";
import { AIRTABLE_CONFIG } from "./config/airtable";
import { getFirstFilmSlug } from "./utils/vimeo";
import Constellation from "./components/Constellation";
import Link from "next/link";
import Image from "next/image";
import Hero from "./components/Hero";
import { Suspense } from "react";

// Enable static generation with revalidation
// export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Server-side data fetching
  let fullData = [];
  let error = null;

  try {
    if (process.env.NODE_ENV === 'development') {
      fullData = [];
    } else {
      fullData = await fetchAirtableDataProgressive(AIRTABLE_CONFIG.defaultTable);
    }
  } catch (err) {
    console.error("Error fetching Airtable data:", err);
    error = err.message;
  }

  const { slug: firstFilmSlug, thumbnail: screeningGif } = await getFirstFilmSlug();

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
      link: `/screening/${firstFilmSlug || 'default'}`,
      image: screeningGif,
      accentColor: "#C4B0EC",
    },
  ];

  return (
    <Suspense>
      <div className="w-screen flex flex-col items-center relative bg-background">
        <div className="lg:w-[70%] w-full h-full flex text-primary flex-col  justify-start items-center bg-background relative bg-contain p-4 sm:p-10">
          {/* Add this gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-100 pointer-events-none"></div> */}
          {/* <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div> */}
          <div className=" flex flex-col gap-8 ">
            {/* <HomeScene /> */}
          </div>

          <div className="w-full h-full  lg:flex flex-row items-center justify-center p-4 relative gap-4 ">
            {/* <h1 className="font-frontage3D text-4xl"> Black Cinema Spaces</h1> */}
            <Hero fullData={fullData} />
       

            {/* <h1 className="text-[5rem] font-sansation border-b-[0.5px]">
          {" "}
          WELCOME TO DREAM PALACES
        </h1> */}
          </div>
               <p className="sm:w-full h-1/2 text-xs sm:text-base xl:text-xl flex flex-col items-start font-light font-avenir   border-primary p-2 sm:p-8">
              Dream Palaces explores the architectural, geographical, and
              cultural histories of Black cinema spaces across six countries in
              Africa and the diaspora. Initiated by an emotional encounter with
              a demolished historical cinema in South Africa, the project aims
              to recontextualize and archive these spaces digitally. It asks:
              how can we disrupt the erasure of Black cinema spaces and
              reimagine them as sites of memory and possibility? Explore over
              1400 black cinemas, each representing a unique story and history,
              via two navigation modes: a constellation where you can uncover
              individual cinema’s narratives or a map showcasing the
              geographical distribution of the cinemas across Africa and the
              diaspora. Alternatively, join us to watch a film in the screening
              room.
              <span className=" mt-4">
                <Link href="/about" className="text-yellow-400 hover:text-white ">
                 Learn More
                </Link>
              </span>
            </p>
        </div>

        <div className="w-[100%] bg-background font-avenir flex  flex-col gap-4  md:p-8 items-center justify-center">
          <p className=" text-yellow-400 pt-8">[ Choose your experience ]</p>

          <div className="flex flex-col gap-8 w-[90%] sm:w-[70%] items-between justify-start py-8 ">
            {modes.map((mode, index) => (
              <Link key={index} href={mode.link}>
                <div 
                  className="w-full h-[10vh] flex items-center justify-center font-frontage relative border-[0.5px] p-4 sm:p-8 transition-all duration-200 ease-in-out hover:border-[var(--accent-color)] group"
                  style={{ '--accent-color': mode.accentColor }}
                >
                  <p className="font-bold text-primary  sm:text-sm xl:text-xl">{mode.name}</p>
                  {mode.image && (
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[250px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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
