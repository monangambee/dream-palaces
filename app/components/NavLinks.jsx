'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ firstFilmSlug }) {
  const pathname = usePathname()

  const getNavLinks = () => {
    // Home page - show nothing
    if (pathname === '/') {
      return []
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
      { href: '/constellation', label: 'Constellation |', hoverColor: 'hover:text-[#ffD700]' },
      { href: '/map', label: 'Map |', hoverColor: 'hover:text-[#007bff]' },
      { href: `/screening/${firstFilmSlug || ''}`, label: 'Screening Room', hoverColor: 'hover:text-[#C4B0EC]' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <ul className="flex w-full h-full font-frontage sm:w-[100%] items-end text-[9px] sm:text-sm sm:p-8 justify-end sm:justify-start flex-row  md:flex-row sm:items-end sm:self-end px-2 gap-8">
      {navLinks.map((link, index) => (
        <div key={link.href} className="flex items-center gap-4">
          <Link className={link.hoverColor} href={link.href}>
            {link.label}
          </Link>
          {index < navLinks.length - 1 && <span>|</span>}
        </div>
      ))}
    </ul>
  )
}
