'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetHeader, SheetTitle, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

const links = [
  { name: 'Home', href: '/' },
  { name: 'Teer Result Today', href: '/teer-result-today' },
  { name: 'Previous Result', href: '/previous-result' },
  { name: 'Dream Number', href: '/dream-number' },
  { name: 'Dashboard', href: '/dashboard', highlight: true },
]

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image src="/footerlogo.png" alt="Logo" width={50} height={30} className="p-1 rounded-sm" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 font-medium text-xl tracking-wide flex-1 justify-center">
          {links.map(link => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`transition duration-300 hover:text-yellow-300 ${
                  link.highlight
                    ? 'bg-blue-600 text-white px-4 py-1.5 rounded-md shadow hover:bg-blue-500'
                    : ''
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-yellow-300 transition">
            SIGN UP
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500 rounded">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-blue-700 text-white w-[260px]">
              <SheetHeader>
                <SheetTitle className="text-white text-lg">Navigation</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4 text-sm">
                {links.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-4 py-2 rounded-md transition ${
                      link.highlight
                        ? 'bg-green-600 text-white shadow'
                        : 'hover:bg-blue-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button className="w-full mt-4 bg-white text-blue-700 hover:bg-yellow-300 font-semibold transition">
                  SIGN UP
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
