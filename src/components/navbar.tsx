// Removed 'use client' - Navbar can be a Server Component if it receives all data as props
// import { useState } from 'react'; // No longer needed if mobile menu is handled differently or Navbar becomes client again later

import Link from 'next/link';
import { ChevronDown } from 'lucide-react'; // Removed Menu, X as they are in MobileNav
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { cn } from '@/lib/utils'; // Not used directly here
import { ModeToggle } from './mode-toggle';
import { MobileNav } from './mobile-nav'; // Import MobileNav

const navLinks = [
  { href: '/', label: 'Startseite' },
  {
    label: 'Unser Verein',
    dropdown: [
      { href: '/vorstand', label: 'Vorstand' },
      { href: '/piloten', label: 'Piloten' },
      { href: '/unser-verein/oldie-cup', label: 'Oldie-Cup' },
    ]
  },
  { href: '/aktivitaeten', label: 'Kart-Slalom' },
  { href: '/news', label: 'News' },
  { href: '/sponsoren', label: 'Sponsoren' },
  {
    label: 'Kontakt',
    dropdown: [
      { href: '/kontakt', label: 'Kontaktformular' },
      { href: '/kontakt/mitglied-werden', label: 'Mitglied werden' },
      { href: '/kontakt/schutzkonzept', label: 'Schutzkonzept' },
    ]
  },
];

interface NavbarProps {
  logoUrl?: string; // Add logoUrl prop
}

export function Navbar({ logoUrl }: NavbarProps) { // Accept logoUrl prop
  // Mobile menu state and toggle logic moved to MobileNav component

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo logoUrl={logoUrl} /> {/* Pass logoUrl to Logo */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) =>
            link.dropdown ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm lg:text-base font-medium">
                    {link.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {link.dropdown.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button key={link.href} variant="ghost" asChild className="text-sm lg:text-base font-medium">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          )}
          <ModeToggle />
        </nav>
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          {/* MobileNav will handle its own open/close button and state */}
          <MobileNav navLinks={navLinks} />
        </div>
      </div>
      {/* Mobile menu rendering (the dropdown part) is now handled by MobileNav's SheetContent */}
    </header>
  );
}
