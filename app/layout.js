import "../styles/globals.css";

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
        <nav className="w-screen flex border-b-[0.5px] flex-col justify-center items-center font-marqueeMoon bg-background border-primary p-2 sm:p-4 text-primary">
          <Link href="/" className="cursor-pointer p-2 sm:p-4 text-3xl sm:text-5xl md:text-7xl">
            Dream Palaces
          </Link>
          <p className='font-frontage pb-2 text-sm sm:text-base'>Black cinema Spaces</p>
        </nav>

        {children}

        <footer className="w-screen min-h-[10vh] flex flex-col sm:flex-row justify-center items-center font-frontage bg-background border-t-[0.5px] border-primary p-4 text-primary gap-4 sm:gap-2 text-xs">
          <div className="flex w-full sm:w-[80%] p-4 sm:p-8 justify-center sm:justify-between flex-row flex-wrap md:flex-row items-center gap-4 h-full">
            <p>
              <Link className="hover:text-yellow-400" href="/">
                Home
              </Link>
            </p>
            <p>
              <Link className="hover:text-[#ffD700]" href="/constellation">
                Constellation
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}
            <p>
              <Link href="/map" className="hover:text-[#007bff]">
                Map
              </Link>
            </p>
            <p>
              <Link href={`/screening/${firstFilmSlug || ''}`} className="hover:text-[#C4B0EC]">
                Screening Room
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
