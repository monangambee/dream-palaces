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

const clash = localFont({
  src: "../public/fonts/ClashDisplay-Variable.woff",
  variable: "--font-clash",
  display: "swap",
  style: "",
  subsets: ["latin"],
  // weight: '200',
});


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


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${frontage3D.variable} ${basis.variable} ${marqueeMoon.variable} ${neon.variable} ${frontage.variable} ${avenir.variable} font-sans`}
    >
      <body>
        <nav className="w-screen flex border-b-[0.5px]  flex-col justify-center items-center font-marqueeMoon bg-background border-primary p-4 text-primary">
          <Link href="/" className="cursor-pointer p-4 text-xl md:text-7xl">
            Dream Palaces
          </Link>
          <p className='font-frontage pb-2'>Black cinema Spaces</p>
        </nav>

        {children}

        <footer className="w-screen lg:h-[10vh] flex flex-row md:flex-row justify-center items-center font-frontage bg-background border-t-[0.5px] border-primary p-4 text-primary gap-2 text-xs">
          <div className="flex w-[80%] p-8 justify-between flex-col md:flex-row items-start h-full">
            {/* <p className="hidden md:block">|</p> */}
            <p>
              <Link className="hidden md:block hover:text-yellow-400" href="/">
                Home
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}
            <p>
              <Link className="hover:text-yellow-400 hidden md:block" href="/constellation">
                Constellation
              </Link>
            </p>
            {/* <p className="hidden md:block">|</p> */}
            <p>
              <Link href="/map" className="hover:text-yellow-400 hidden md:block">
                Map
              </Link>
            </p>
            {/* <p className="hidden md:block"></p> */}
            <p>
              <Link href="/screening/NiUSiqPpmtsqaBeSmSDhbItV72hIBaH7TdpIpudDDbo" className="hidden md:block">
                Screening Room
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
