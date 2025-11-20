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

const chillax = localFont({
  src: "../public/fonts/Chillax-Regular.woff",
  variable: "--font-chillax",
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
      className={`${openSans.variable} ${robotoMono.variable} ${moirai.variable} ${jura.variable} ${clash.variable} ${FascinateInline.variable} ${chillax.variable} ${basis.variable} font-sans`}
    >
      <body>
        <nav className="w-screen flex justify-center items-center font-chillax bg-background  border-b-[0.5px] border-primary p-4 text-primary">
          <Link href="/" className="cursor-pointer p-4 text-5xl">
            Dream Palaces
          </Link>
        </nav>

        {children}

        <footer className="w-screen h-[10vh] flex flex-col md:flex-row justify-center items-center font-basis  bg-background  border-t-[0.5px] border-primary p-4 text-primary gap-2 text-xs">
          <p>© 2025 Dream Palaces</p>
          <p className="hidden md:block">|</p>
          <p>
            <Link className="underline" href="/">
              Home
            </Link>
          </p>
          <p className="hidden md:block">|</p>
          <p>
            <Link className="underline" href="/constellation">
              Constellation
            </Link>
          </p>
          <p className="hidden md:block">|</p>
          <p>
            <Link href="/map" className="underline">
              Map
            </Link>
          </p>
          <p className="hidden md:block">|</p>
          <p>
            <Link href="/screening/S02mJ9OS4IrPAM7Wqchn3q2Q9L4xPpDRUSAHgOswaATw" className="underline">
              Screening Room
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
