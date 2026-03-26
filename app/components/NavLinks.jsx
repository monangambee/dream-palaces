/**
 * NavLinks – Context-Aware Footer Navigation
 *
 * Renders a different set of navigation links depending on the current
 * route so the user always sees relevant destinations.
 *
 * On the home page it shows social-media icons instead of text links.
 * `firstFilmSlug` is passed from the root layout (resolved server-side
 * via Vimeo API) so the "Screening Room" link always points to the
 * first available film.
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NavLinks({ firstFilmSlug }) {
  const pathname = usePathname();

  /** Return the link set (or 'icons') for the current route */
  const getNavLinks = () => {
    // Home page - show social icons
    if (pathname === "/") {
      return "icons";
    }

    // Constellation page - show screening room and map
    if (pathname === "/constellation") {
      return [
        { href: "/map", label: "Map", hoverColor: "hover:text-[#007bff]" },
        {
          href: `/screening/${firstFilmSlug || ""}`,
          label: "Screening Room",
          hoverColor: "hover:text-[#C4B0EC]",
        },
        { href: "/", label: "Home", hoverColor: "hover:text-[#FDF9ED]" },
      ];
    }

    // Map page - show constellation and screening room
    if (pathname === "/map") {
      return [
        {
          href: "/constellation",
          label: "Constellation",
          hoverColor: "hover:text-[#ffD700]",
        },
        {
          href: `/screening/${firstFilmSlug || ""}`,
          label: "Screening Room",
          hoverColor: "hover:text-[#C4B0EC]",
        },
        { href: "/", label: "Home", hoverColor: "hover:text-[#FDF9ED]" },
      ];
    }

    // Screening room - show constellation and map
    if (pathname.startsWith("/screening")) {
      return [
        {
          href: "/constellation",
          label: "Constellation",
          hoverColor: "hover:text-[#ffD700]",
        },
        { href: "/map", label: "Map", hoverColor: "hover:text-[#007bff]" },
        { href: "/", label: "Home", hoverColor: "hover:text-[#FDF9ED]" },
      ];
    }

    // About page - show all main pages
    if (pathname === "/about") {
      return [
        {
          href: "/constellation",
          label: "Constellation",
          hoverColor: "hover:text-[#ffD700]",
        },
        { href: "/map", label: "Map", hoverColor: "hover:text-[#007bff]" },
        {
          href: `/screening/${firstFilmSlug || ""}`,
          label: "Screening Room",
          hoverColor: "hover:text-[#C4B0EC]",
        },
        { href: "/", label: "Home", hoverColor: "hover:text-[#FDF9ED]" },
      ];
    }

    // Default - show all
    return [
      {
        href: "/constellation",
        label: "Constellation",
        hoverColor: "hover:text-[#ffD700]",
      },
      { href: "/map", label: "Map", hoverColor: "hover:text-[#007bff]" },
      {
        href: `/screening/${firstFilmSlug || ""}`,
        label: "Screening Room",
        hoverColor: "hover:text-[#C4B0EC]",
      },
    ];
  };

  const navLinks = getNavLinks();

  // Show icons on home page
  if (navLinks === "icons") {
    return (
      <div className="flex items-center justify-center gap-6">
        <Link
          href="mailto:monangambee@gmail.com"
          className="hover:text-homeAccent"
        >
          <Image
            src={"/icons/email.png"}
            alt="Email Icon"
            width={24}
            height={24}
            className="invert"
          />
        </Link>

        <Link
          href={"https://www.instagram.com/monangambee/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={"/icons/insta.png"}
            alt="Instagram Icon"
            width={24}
            height={24}
            className="invert"
          />
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex w-full h-full font-frontage sm:w-[100%] items-center text-[9px] sm:text-sm sm:p-8 justify-center flex-row md:flex-row px-2 gap-0">
      {navLinks.map((link, index) => (
        <li key={link.href} className="flex items-center">
          <Link className={link.hoverColor} href={link.href}>
            {link.label}
          </Link>
          {index < navLinks.length - 1 && <span className="mx-4">|</span>}
        </li>
      ))}
    </ul>
  );
}
