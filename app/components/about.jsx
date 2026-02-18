import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const About = () => {
  return (
    <section className='w-full h-full flex items-center flex-col justify-center '>
      <div className='flex h-full lg:min-h-[55vh] flex-col lg:flex-row w-[100%] justify-center gap-8 p-4 sm:p-6 border-[0.5px] z-50 text-white py-4 sm:py-8'>
        <div className='relative w-full lg:w-1/2 h-[300px] sm:h-[500px]'>
          <Image
            src='/images/Seattle WA Anzier.jpg'
            fill
            alt='Cinema Image'
            className='object-cover object-center'
            priority
          />
        </div>
        <div className='w-full lg:w-1/2 flex h-full items-start flex-col gap-6 '>
          <p className='w-full h-full md:w-[100%] text-xs gap-8 z-20  xl:text-base 2xl:text-lg items-start justify-start font-light font-frontage border-primary leading-relaxed'>
           <span className='font-marqueeMoon text-4xl sm:text-5xl xl:text-7xl inline align-baseline'>
             Dream Palaces
            </span>
            
            explores the architectural, geographical, and cultural
            histories of Black cinema spaces across six countries in Africa and
            the diaspora.

            <span className='font-avenir pt-5 inline-block text-xs sm:text-base xl:text-base 2xl:text-lg  '>
              Initiated by an emotional encounter with a demolished
              historical cinema in South Africa, the project aims to
              recontextualize and archive these spaces digitally. It asks: how can
              we disrupt the erasure of Black cinema spaces and reimagine them as
              sites of memory and possibility?
            </span>

            <span className='font-avenir overflow-auto pt-5 text-xs sm:text-base xl:text-base 2xl:text-lg inline-block'>
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
                className='text-white uppercase md:hover:text-homeAccent p-3 font-basis text-xs lg:text-base border-[0.5px] border-white '
              >
                Learn More
              </Link>
        </div>
      </div>
    </section>
  )
}

export default About