'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <nav className="w-full  z-50 bg-black flex border-b-[0.5px] pt-8 p-4 flex-row justify-center items-center text-center font-marqueeMoon bg-background mx-auto border-primary gap-4 sm:p-4 sm:px-8 text-primary">
      <Link href="/" className="cursor-pointer w-full  sm:p-4 text-5xl sm:text-5xl md:text-7xl  2xl:text-8xl flex flex-col sm:w-2/3">
        Dream Palaces
        <span className='font-frontage pb-2 text-[8px] sm:text-sm pt-2'>Black cinema Spaces</span>
      </Link>
    </nav>
  )
}