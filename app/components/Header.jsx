'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header({ firstFilmSlug }) {
  const pathname = usePathname()

  // Define which links to show for each route
  const getNavLinks = () => {
    // Home page - show all
    if (pathname === '/') {
      return [
        { href: '/constellation', label: 'Constellation', hoverColor: 'hover:text-[#ffD700]' },
        { href: '/map', label: 'Map', hoverColor: 'hover:text-[#007bff]' },
        { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
      ]
    }

    // Constellation page - show screening room and map
    if (pathname === '/constellation') {
      return [
        { href: '/map', label: 'Map', hoverColor: 'hover:text-[#007bff]' },
        { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
      ]
    }

    // Map page - show constellation and screening room
    if (pathname === '/map') {
      return [
        { href: '/constellation', label: 'Constellation', hoverColor: 'hover:text-[#ffD700]' },
        { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
      ]
    }

    // Screening room - show constellation and map
    if (pathname.startsWith('/screening')) {
      return [
        { href: '/constellation', label: 'Constellation', hoverColor: 'hover:text-[#ffD700]' },
        { href: '/map', label: 'Map', hoverColor: 'hover:text-[#007bff]' },
      ]
    }

    // About page - show all main pages
    if (pathname === '/about') {
      return [
        { href: '/constellation', label: 'Constellation', hoverColor: 'hover:text-[#ffD700]' },
        { href: '/map', label: 'Map', hoverColor: 'hover:text-[#007bff]' },
        { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
      ]
    }

    // Default - show all
    return [
      { href: '/constellation', label: 'Constellation', hoverColor: 'hover:text-[#ffD700]' },
      { href: '/map', label: 'Map', hoverColor: 'hover:text-[#007bff]' },
      { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <nav className="w-screen bg-black flex border-b-[0.5px] flex-row justify-start items-center font-marqueeMoon bg-background mx-auto border-primary p-2 sm:p-4 sm:px-8 text-primary">
      <Link href="/" className="cursor-pointer p-2 sm:p-4 text-4xl sm:text-5xl md:text-8xl flex flex-col w-2/3">
        Dream Palaces
        <span className='font-frontage pb-2 text-[8px] sm:text-sm pt-2'>Black cinema Spaces</span>
      </Link>

      <ul className="flex w-full h-full font-frontage sm:w-[80%] text-xs sm:text-sm p-4 sm:p-8 justify-center sm:justify-end flex-row flex-wrap md:flex-row items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link className={link.hoverColor} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}