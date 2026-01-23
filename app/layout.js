import "../styles/globals.css";
import Image from "next/image";

export const metadata = {
  title: "Dream Palaces",
  description: "Interactive visualization of cinema data",
};

import {
  // Open_Sans,
  // Roboto_Mono,
  // Moirai_One,
  // Jura,
  // Fascinate_Inline,
} from "next/font/google";

import localFont from "next/font/local";
import Link from "next/link";
import { getFirstFilmSlug } from "./utils/vimeo";




const avenir = localFont({
  src: "../public/fonts/AvenirLTProRoman.otf",
  variable: "--font-avenir",
  display: "swap",
  style: "",
  subsets: ["latin"],
  // weight: '200',
});


const frontage3D = localFont({
  src: "../public/fonts/FrontageProTest-3D.otf",
  variable: "--font-frontage3D",
  display: "swap",
  style: "normal",
});

const frontage = localFont({
  src: "../public/fonts/FrontageProTest.otf",
  variable: "--font-frontage",
  display: "swap",
  style: "normal",
});

const marqueeMoon = localFont({
  src: "../public/fonts/Marquee Moon.otf",
  variable: "--font-marqueMoon",
  display: "swap",
  style: "normal",
});

const neon = localFont({
  src: "../public/fonts/Neon Light.otf",
  variable: "--font-neon",
  display: "swap",
  style: "normal",
});



const basis = localFont({
  src: "../public/fonts/BasisGrotesqueMonoPro-Regular.woff",
  variable: "--font-basis",
  display: "swap",
  style: "normal",
});


export default async function RootLayout({ children }) {
  const { slug: firstFilmSlug } = await getFirstFilmSlug();
  return (
    <html
      lang="en"
      className={`${frontage3D.variable} ${basis.variable} ${marqueeMoon.variable} ${neon.variable} ${frontage.variable} ${avenir.variable} font-sans`}
    >
      <body>
        <nav className="w-screen bg-black flex border-b-[0.5px] flex-row justify-start items-center font-marqueeMoon bg-background mx-auto border-primary p-2 sm:p-4 text-primary">
          <Link href="/" className="cursor-pointer p-2 sm:p-4 text-3xl sm:text-5xl md:text-8xl flex flex-col w-2/3">
          Dream Palaces
          <span className='font-frontage pb-2 text-sm sm:text-sm pt-2'>Black cinema Spaces</span>

          </Link>

             <ul className="flex w-full h-full font-frontage sm:w-[80%] p-4 sm:p-8  justify-center sm:justify-between flex-row flex-wrap md:flex-row items-center gap-4 ">
            {/* <p>
              <Link className="hover:text-homeAccent" href="/">
                Home 
              </Link>
            </p> */}
            {/* <p className="hidden md:block">|</p> */}

            <li>
              <Link className="hover:text-[#ffD700]" href="/constellation">
                Constellation 
              </Link>
            </li>
            {/* <p className="hidden md:block">|</p> */}
            <li>
              <Link href="/map" className="hover:text-[#007bff]">
                Map 
              </Link>
            </li>
            {/* <p className="hidden md:block">|</p> */}

            <li>
              <Link href={`/screening/${firstFilmSlug || ''}`} className="hover:text-[#C4B0EC]">
                Screening Room
              </Link>
            </li>
          </ul>
        </nav>

        {children}

        <footer className="w-screen min-h-[10vh] flex z-20  justify-center  font-frontage bg-background border-t-[0.5px] border-primary text-primary  text-xs">
          <div className="flex justify-center w-[80%] items-center flex-col sm:flex-row gap-4 sm:gap-2 p-4">
          <div className="flex w-full sm:w-[80%] p-4 sm:p-8 justify-start sm:justify-between flex-col flex-wrap md:flex-col items-start gap-4 h-full">
            <h2 className="text-sm">Quick Links</h2>
            <p>
              <Link className="hover:text-homeAccent" href="/">
                Home 
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}

            <p>
              <Link className="hover:text-[#ffD700]" href="/about">
                About 
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}
            {/* <p>
              <Link href="/map" className="hover:text-[#007bff]">
                Map 
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}

            {/* <p>
              <Link href={`/screening/${firstFilmSlug || ''}`} className="hover:text-[#C4B0EC]">
                Screening Room
              </Link> 
            </p> */}
          </div>
          <div className="flex text-sm flex-col">
            <p>
              Contact
            </p>
            <Link href="mailto:monangambee@gmail.com " className="hover:text-homeAccent pt-4">
              monangambee@gmail.com
            </Link>

            <Link href={'https://www.instagram.com/monangambee/'} target="_blank" rel="noopener noreferrer">

              <Image src={'/icons/insta.png'}
                alt="Instagram Icon"
                width={24}
                height={24}
                className="mt-2 invert pt-2"
              />
            </Link>
          </div>
            </div>

        </footer>
      </body>
    </html>
  );
}
