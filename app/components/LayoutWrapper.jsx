'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  
  // Hide header and footer when viewing a specific film (path pattern: /screening/[film])
  const isViewingFilm = pathname?.startsWith('/screening/') && pathname.split('/').length === 3 && pathname.split('/')[2] !== ''
  
  return (
    <>
      {!isViewingFilm && (
        <nav className="w-screen flex flex-col justify-center items-center font-marqueeMoon bg-background  border-primary p-4 text-primary">
          <Link href="/" className="cursor-pointer p-4 text-xl md:text-7xl">
            Dream Palaces
          </Link>
          <p className='font-frontage'>Black cinema Spaces</p>
        </nav>
      )}

      {children}

      {!isViewingFilm && (
        <footer className="w-screen lg:h-[10vh] flex flex-row md:flex-row justify-center items-center font-frontage bg-background border-t-[0.5px] border-primary p-4 text-primary gap-2 text-xs">
          <div className="flex w-[80%] p-8 justify-between flex-col md:flex-row items-start h-full">
            {/* <p>© 2025 Dream Palaces</p> */}
            <p className="hidden md:block">|</p>
            <p>
              <Link className=" hidden md:block hover:text-yellow-400" href="/">
                Home
              </Link>
            </p>
            <p className="hidden md:block">|</p>
            <p>
              <Link className=" hover:text-yellow-400 hidden md:block" href="/constellation">
                Constellation
              </Link>
            </p>
            <p className="hidden md:block">|</p>
            <p>
              <Link href="/map" className=" hover:text-yellow-400 hidden md:block">
                Map
              </Link>
            </p>
            <p className="hidden md:block">|</p>
            <p>
              <Link href="/screening/NiUSiqPpmtsqaBeSmSDhbItV72hIBaH7TdpIpudDDbo" className=" hidden md:block">
                Screening Room
              </Link>
            </p>
          </div>
        </footer>
      )}
    </>
  )
}
