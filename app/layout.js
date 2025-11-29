import "../styles/globals.css";

export const metadata = {
  title: "Dream Palaces",
  description: "Interactive visualization of cinema data",
};

import {
  Open_Sans,
  Roboto_Mono,
  Moirai_One,
  Jura,
  Fascinate_Inline,
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

const FascinateInline = Fascinate_Inline({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fascinate",
  weight: "400",
});

const moirai = Moirai_One({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-moirai",
  weight: "400",
});

const frontage3D = localFont({
  src: "../public/fonts/FrontageProTest-3D.otf",
  variable: "--font-frontage3D",
  display: "swap",
  style: "normal",
});

const basis = localFont({
  src: "../public/fonts/BasisGrotesqueMonoPro-Regular.woff",
  variable: "--font-basis",
  display: "swap",
  style: "normal",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  //👇 Add variable to our object
  variable: "--font-opensans",
});

//👇 Configure the object for our second font
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const jura = Jura({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jura",
  weight: "400",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${robotoMono.variable} ${moirai.variable} ${jura.variable}   ${frontage3D.variable} ${basis.variable} font-sans`}
    >
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
