
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from './mode-toggle';
import { MobileNav } from './mobile-nav';
import type { SiteSettings } from '@/types';

const navLinks = [
  { href: '/', label: 'Startseite' },
  {
    label: 'Unser Verein',
    dropdown: [
      { href: '/vorstand', label: 'Vorstand' },
      { href: '/piloten', label: 'Piloten' },
      { href: '/unser-verein/oldie-cup', label: 'Oldie-Cup' },
      { href: '/unser-verein/kalender', label: 'Termine & Kalender' },
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


export function Navbar() {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Since this is a client component, we fetch from the public API endpoint
        const settingsRes = await fetch('/api/admin/settings/homepage-images');
        if (settingsRes.ok) {
          const settingsData: Partial<SiteSettings> = await settingsRes.json();
          setLogoUrl(settingsData.logoUrl);
        }
      } catch (error) {
        console.error("Failed to fetch site settings for Navbar:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo logoUrl={logoUrl} />
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
          <MobileNav navLinks={navLinks} />
        </div>
      </div>
    </header>
  );
}
