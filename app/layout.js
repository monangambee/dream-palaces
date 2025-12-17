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
import LayoutWrapper from "./components/LayoutWrapper";

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
