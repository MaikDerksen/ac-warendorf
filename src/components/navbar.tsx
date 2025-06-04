
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Startseite' },
  {
    label: 'Unser Verein', // Renamed from 'Kart-Slalom'
    dropdown: [
      { href: '/vorstand', label: 'Vorstand' }, // Moved
      { href: '/piloten', label: 'Piloten' }, // Moved
      { href: '/unser-verein/oldie-cup', label: 'Oldie-Cup' }, // New
    ]
  },
  { href: '/aktivitaeten', label: 'Kart-Slalom' }, // Renamed from 'Aktivitäten'
  { href: '/news', label: 'News' },
  { href: '/sponsoren', label: 'Sponsoren' }, // New
  {
    label: 'Kontakt', // Now a dropdown
    dropdown: [
      { href: '/kontakt', label: 'Kontaktformular' }, // Existing contact page
      { href: '/kontakt/mitglied-werden', label: 'Mitglied werden' }, // Moved
      { href: '/kontakt/schutzkonzept', label: 'Schutzkonzept' }, // New
    ]
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) =>
            link.dropdown ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm lg:text-base font-medium hover:bg-accent/10">
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
              <Button key={link.href} variant="ghost" asChild className="text-sm lg:text-base font-medium hover:bg-accent/10">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          )}
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Menü öffnen/schließen</span>
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t">
          <nav className="flex flex-col space-y-1 px-2 py-3">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label} className="flex flex-col">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start px-3 py-2 text-base font-medium">
                        {link.label}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {link.dropdown.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="block px-3 py-2 text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-base font-medium rounded-md hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
