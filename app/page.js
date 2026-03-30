/**
 * Home Page (Server Component)
 *
 * Fetches the full cinema dataset server-side and passes it to<Hero>
 * for the photo carousel. Also resolves the first film slug for the
 * "Screening Room" experience card.
 *
 * Three experience modes are presented as clickable cards:
 *  - Constellation (3D particle view)
 *  - Map (external iframe)
 *  - Screening Room (Vimeo player)
 */

import { fetchData, fetchTextDataForWebsite } from "./utils/data";
import { AIRTABLE_CONFIG } from "./config/airtable";
import { getFirstFilmSlug } from "./utils/vimeo";

import Link from "next/link";

import Hero from "./components/Hero";
import About from "./components/about";
import { Suspense } from "react";

export default async function HomePage() {
  // Server-side data fetching
  let fullData = [];
  let websiteTextData = [];
  let aboutTextData = "";
  let error = null;

  try {
    if (process.env.NODE_ENV !== "development") {
      fullData = [];
    } else {
      fullData = await fetchData(AIRTABLE_CONFIG.defaultTable);
    }

    websiteTextData = await fetchTextDataForWebsite();
    aboutTextData = websiteTextData[0]?.fields.Text || {};
  } catch (err) {
    console.error("Error fetching Airtable data:", err);
    error = err.message;
  }

  const { slug: firstFilmSlug, thumbnail: screeningGif } =
    await getFirstFilmSlug();

  // Experience mode cards shown at the bottom of the home page
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
      <main className="w-screen flex flex-col items-center gap-16 relative bg-background overflow-hidden  ">
        <section className="lg:w-[100%] w-full h-full flex text-primary flex-col gap-16 justify-start items-center bg-background relative bg-contain sm:p-4 sm:pt-2">
          {/* Add this gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-100 pointer-events-none"></div> */}
          {/* <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div> */}
          <div className=" flex flex-col gap-8 absolute inset-0 -z-1 w-screen h-screen top-0 -left-2">
            {/* <HomeScene /> */}
            {/* <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/stars.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video> */}
          </div>

          {/* <section className="w-full h-full flex flex-col lg:flex-row items-center justify-center  relative"> */}
          <Hero fullData={fullData} />

          {/* <h1 className="text-[5rem] font-sansation border-b-[0.5px]">
          {" "}
          WELCOME TO DREAM PALACES
        </h1> */}

          <section className="  ">
            <About textData={aboutTextData} />
          </section>
        </section>

        <div className="w-[100%] h-full bg-background font-avenir flex  flex-col md:px-16 xl:px-24 items-center justify-center pb-8">
          <div className="flex flex-col gap-4 sm:gap-8 w-[100%]  items-between justify-start px-4 xl:px-32 pb-8">
            <p className=" text-primary z-10 pb-2  text-center uppercase font-avenir text-xs 2xl:text-sm sm:text-sm">
              [ Choose your experience ]
            </p>
            {modes.map((mode, index) => (
              <Link key={index} href={mode.link}>
                <div
                  className="w-full min-h-[12vh] sm:min-h-[15vh] flex items-center justify-center font-frontage relative border-[0.5px] p-6 sm:p-8 transition-all duration-200 ease-in-out md:hover:border-[var(--accent-color)] active:border-[var(--accent-color)] group"
                  style={{ "--accent-color": mode.accentColor }}
                >
                  <p className="font-bold text-primary text-xs sm:text-sm xl:text-base">
                    {mode.name}
                  </p>
                  {mode.image && (
                    <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[250px] xl:w-[280px] 2xl:w-[300px] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-100">
                      <img
                        src={mode.image}
                        alt={mode.name}
                        className="w-full h-auto border aspect-square object-cover border-primary rounded"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Suspense>
  );
}
