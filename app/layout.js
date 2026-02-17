import "../styles/globals.css";
import Image from "next/image";
import Header from "./components/Header";

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
        <Header firstFilmSlug={firstFilmSlug} />

        {children}

        <footer className="w-full min-h-[10vh] flex z-20  justify-center font-frontage bg-background border-t-[0.5px] border-primary text-primary p-2  text-[10px]  sm:text-xs">
          <div className="p-2 flex w-full sm:w-[100%] items-start flex-row justify-between sm:flex-row gap-4 sm:gap-2 px-2 sm:px-16">
          <div className="flex w-full sm:w-[80%]  sm:p-2 justify-start sm:justify-start flex-col  md:flex-col items-start gap-8 h-full">
            {/* <h2 className="text-sm">Quick Links</h2> */}
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
          <div className="flex h-full justify-start items-center sm:justify-center  sm:p-4 flex-col sm:flex-row sm:gap-6">
            {/* <p className="hidden sm:block">
              Contact
            </p> */}
            <Link href="mailto:monangambee@gmail.com " className="hover:text-homeAccent ">
              <Image src={'/icons/email.png'}
                alt="Email Icon"
                width={24}
                height={24}
                className=" invert"
                
              />
            </Link>

            <Link href={'https://www.instagram.com/monangambee/'} target="_blank" rel="noopener noreferrer">

              <Image src={'/icons/insta.png'}
                alt="Instagram Icon"
                width={24}
                height={24}
                className="mt-2 sm:mt-0 invert pt-3 sm:pt-0"
                
              />
            </Link>
          </div>
            </div>

        </footer>
      </body>
    </html>
  );
}
