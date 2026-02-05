import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const About = () => {
  return (
    <section className='w-screen h-fit flex items-center px-64 mt-4'>
      <div className='flex flex-col md:flex-row w-full gap-8 p-2 bg-white z-50 text-black py-8'>
        <div className='relative w-full md:w-1/2 h-[50vh] '>
          <Image
            src='/images/Seattle WA Anzier.jpg'
            fill
            alt='Cinema Image'
            className='object-cover object-center'
            priority
          />
        </div>
        <div className='w-full md:w-1/2 flex h-full items-start flex-col gap-6 '>
          <p className='w-full  md:w-[80%] text-xs gap-8 z-20 sm:text-base xl:text-base  items-start justify-start font-light font-frontage border-primary leading-relaxed'>
           <span className='font-marqueeMoon text-5xl inline align-baseline'>
             Dream Palaces
            </span>
            
            explores the architectural, geographical, and cultural
            histories of Black cinema spaces across six countries in Africa and
            the diaspora.

            <span className='font-avenir pt-4 inline-block'>
              Initiated by an emotional encounter with a demolished
              historical cinema in South Africa, the project aims to
              recontextualize and archive these spaces digitally. It asks: how can
              we disrupt the erasure of Black cinema spaces and reimagine them as
              sites of memory and possibility?
            </span>

            <span className='font-avenir pt-4'>
              {' '}
              Explore over 1400 black cinemas, each representing a unique story
              and history, via two navigation modes: a constellation where you
              can uncover individual cinema’s narratives or a map showcasing the
              geographical distribution of the cinemas across Africa and the
              diaspora. Alternatively, join us to watch a film in the screening
              room.
            </span>
            <span className='mt-4 text-xs sm:text-sm'>
            
            </span>
          </p>
            <Link
                href='/about'
                className='text-black uppercase md:hover:text-homeAccent p-4 border-[0.5px] border-black '
              >
                Learn More
              </Link>
        </div>
      </div>
    </section>
  )
}

export default About