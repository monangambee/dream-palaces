import { fetchAirtableDataProgressive } from "./src/utils/data";
import { AIRTABLE_CONFIG } from "./src/config/airtable";
import Constellation from "./components/Constellation";
import Link from "next/link";
import Image from "next/image";
import Hero from "./components/Hero";
import HomeScene from "./components/HomeScene";
import { Suspense } from "react";
import { Vimeo } from 'vimeo';

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Server-side data fetching
  let fullData = [];
  let error = null;
  let screeningGif = "";

  try {
    // Skip API calls in development to avoid wasting API quota
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using empty data, client will handle caching');
      fullData = [];
    } else {
      console.log('Fetching Airtable data at build time...');
      fullData = await fetchAirtableDataProgressive(AIRTABLE_CONFIG.defaultTable);
    }
  } catch (err) {
    console.error("Error fetching Airtable data:", err);
    error = err.message;
  }

  // Fetch screening room thumbnail and first film slug from Vimeo
  let firstFilmSlug = '';
  try {
    const client = new Vimeo(
      process.env.VIMEO_CLIENT_ID,
      process.env.VIMEO_CLIENT_SECRET,
      process.env.VIMEO_ACCESS_TOKEN
    )

    const videos = await new Promise((resolve, reject) => {
      client.request({
        method: 'GET',
        path: '/me/videos',
        query: { per_page: 1, fields: 'uri,name,pictures' }
      }, (error, body) => {
        if (error) reject(error)
        else resolve(body)
      })
    })

    if (videos.data && videos.data.length > 0) {
      const firstVideo = videos.data[0]
      screeningGif = firstVideo.pictures?.sizes?.[firstVideo.pictures.sizes.length - 1]?.link || ''
      firstFilmSlug = firstVideo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }
  } catch (vimeoErr) {
    console.error('Error fetching Vimeo videos:', vimeoErr)
  }

  const modes = [
    {
      name: "CONSTELLATION",
      description:
        "Explore a constellation of over 1000 cinemas, each representing a unique story and history. Click on individual cinemas to uncover their narratives.",
      link: "/constellation",
      image: "/constellation.gif",
    },
    {
      name: "MAP",
      description:
        "Navigate a map showcasing the geographical distribution of cinemas across Africa and the diaspora. Zoom in to discover detailed information about each location.",
      link: "/map",
      image: "/map.png",
    },
    {
      name: "SCREENING ROOM",
      description:
        "Use your mobile device to experience movies from a virtual screening room.",
      link: `/screening/${firstFilmSlug || 'default'}`,
      image: screeningGif,
    },
  ];

  return (
    <Suspense>
      <div className="w-screen flex flex-col items-center relative bg-background">
        <div className="lg:w-[70%] h-full flex text-primary flex-col  justify-start items-center bg-background relative bg-contain p-4 sm:p-10">
          {/* Add this gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-100 pointer-events-none"></div> */}
          {/* <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div> */}
          <div className=" flex flex-col gap-8 ">
            {/* <HomeScene /> */}
          </div>

          <div className="w-full h-full hidden lg:flex flex-row items-center justify-center p-4 relative gap-4 ">
            {/* <h1 className="font-frontage3D text-4xl"> Black Cinema Spaces</h1> */}
            <Hero fullData={fullData} />
       

            {/* <h1 className="text-[5rem] font-sansation border-b-[0.5px]">
          {" "}
          WELCOME TO DREAM PALACES
        </h1> */}
          </div>
               <p className="w-2/3 h-1/2 text-xs xl:text-sm flex flex-col items-start font-light font-basis border-[0.5px]  border-primary p-8">
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

        <div className="w-[100%] bg-background font-basis flex  flex-col gap-4  md:p-8 items-center justify-center">
          <p className=" text-yellow-400 pt-8">[ Choose your experience ]</p>

          <div className="flex flex-col gap-8 w-[90%] sm:w-[70%] items-between justify-start py-8 ">
            {modes.map((mode, index) => (
              <Link key={index} href={mode.link}>
                <div className="w-full h-[10vh] flex items-center font-frontage relative border-[0.5px] p-4 sm:p-8 transition-all duration-200 ease-in-out hover:border-yellow-400 group">
                  <p className="font-bold text-primary text-xl">{mode.name}</p>
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
