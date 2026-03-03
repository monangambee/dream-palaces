'use client'

import { usePathname } from 'next/navigation'
import NavLinks from './NavLinks'

export default function Footer({ firstFilmSlug }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return (
      <footer className="w-full min-h-[15vh] 2xl:min-h-[10vh] flex z-0 items-center justify-center font-frontage bg-background border-t-[0.5px] border-primary text-primary p-2 text-[10px] sm:text-xs">
        <NavLinks firstFilmSlug={firstFilmSlug} />
      </footer>
    )
  }

  return (
    <footer className="w-full min-h-[15vh] 2xl:min-h-[10vh] flex z-0 justify-center font-frontage bg-background border-t-[0.5px] border-primary text-primary p-2 text-[10px] sm:text-xs">
      <NavLinks firstFilmSlug={firstFilmSlug} />
    </footer>
  )
}
