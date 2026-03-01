'use client'


import React, {useRef} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const textRef = useRef(null)
  const span1Ref = useRef(null)
  const span2Ref = useRef(null)
  const span3Ref = useRef(null)

  useGSAP(() => {
    gsap.fromTo(
      [textRef.current, span1Ref.current, span2Ref.current, span3Ref.current],
      { opacity: 0.3, y: 0 },
      {
        opacity: 1,
        y: -5,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
    
        },
      }
    )
  }
  )
  return (
    <section className='w-full h-full flex items-center flex-col justify-start px-4 sm:px-0'>
      <div className='flex h-full   flex-col items-start lg:flex-row w-[100%] justify-center   z-50 text-primary'>
        {/* <div className='relative w-full lg:w-1/2 h-[300px] sm:h-[500px]'>
          <Image
            src='/images/Seattle WA Anzier.jpg'
            fill
            alt='Cinema Image'
            className='object-cover object-center'
            priority
          />
        </div> */}
        <div className='w-full lg:w-1/2 flex h-full justify-start items-center text-center flex-col gap-4 '>
          <p 
          ref={textRef}
          className='w-full h-full flex flex-col md:w-[100%] text-xs  z-20 gap-2 sm:text-base xl:text-2xl items-start justify-start font-light font-avenir leading-relaxed'>
           {/* <span className=' text-4xl sm:text-5xl xl:text-7xl inline align-baseline'> */}
            Dream Palaces
            {/* </span> */}
            explores the architectural, geographical, and cultural
            histories of Black cinema spaces across six countries in Africa and
            the diaspora.

            <span 
              ref={span1Ref}
              className='font-avenir inline-block  '>
              Initiated by an emotional encounter with a demolished
              historical cinema in South Africa, the project aims to
              recontextualize and archive these spaces digitally. It asks: how can
              we disrupt the erasure of Black cinema spaces and reimagine them as
              sites of memory and possibility?
            </span>

            <span 
              ref={span2Ref}
              className='font-avenir overflow-auto inline-block'>
              {' '}
              Explore over 1400 black cinemas, each representing a unique story
              and history, via two navigation modes: a constellation where you
              can uncover individual cinema’s narratives or a map showcasing the
              geographical distribution of the cinemas across Africa and the
              diaspora. Alternatively, join us to watch a film in the screening
              room.
            </span>
            <span 
              ref={span3Ref}
              className=' text-xs sm:text-sm'>
            
            </span>
          </p>
            <Link
                href='/about'
                className='text-primary uppercase md:hover:bg-primary hover:text-black p-3 xl:p-4 font-avenir text-xs lg:text-xs border-[0.5px] border-primary '
              >
                Learn More
              </Link>
        </div>
      </div>
    </section>
  )
}

export default About