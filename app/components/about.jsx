"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const About = ({ textData }) => {
  const textRef = useRef(null);
  const span1Ref = useRef(null);
  const span2Ref = useRef(null);
  const span3Ref = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      [textRef.current, span1Ref.current, span2Ref.current, span3Ref.current],
      { opacity: 0.2, y: 0 },
      {
        opacity: 1,
        y: -5,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 100%",
          end: "top 10%",
          scrub: true,
        },
      },
    );
  });
  return (
    <section className="w-full h-full flex items-center flex-col justify-start px-4 sm:px-0">
      <div className="flex h-full   flex-col items-start lg:flex-row w-[100%] justify-center   z-50 text-primary">
        <div className="w-full px-2 xl:px-72 flex h-full justify-start items-center flex-col ">
          <p
            ref={textRef}
            className="w-full lg:w-full h-full flex flex-col text-sm/8 tracking-wide z-20 gap-4 sm:text-lg/7 lg:text-xl/7  2xl:text-2xl/7 items-start justify-start font-light font-avenir pb-6  "
          >
            {textData}
          </p>

          <Link
            href="/about"
            className="text-primary uppercase md:hover:bg-primary hover:text-black p-3 xl:p-5 font-avenir text-xs lg:text-xs border-[0.5px] border-primary "
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
