
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react'; // X and ChevronDown are not directly needed here
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose, // To close sheet on item click
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface NavLinkItem {
  href: string;
  label: string;
}
interface NavLinkGroup {
  label: string;
  dropdown: NavLinkItem[];
}
type NavLink = NavLinkItem | NavLinkGroup;

interface MobileNavProps {
  navLinks: NavLink[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü öffnen/schließen">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menü öffnen/schließen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[340px] bg-card p-0">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium font-headline text-primary">Navigation</h3>
        </div>
        <nav className="flex flex-col space-y-0 p-2"> {/* Reduced space-y for tighter packing */}
          {navLinks.map((link) => (
            'dropdown' in link ? (
              <Accordion type="single" collapsible className="w-full" key={link.label}>
                <AccordionItem value={link.label} className="border-b-0">
                  <AccordionTrigger className="px-2 py-3 text-base font-medium rounded-md hover:bg-muted hover:no-underline data-[state=open]:bg-muted">
                    {/* AccordionTrigger includes its own Chevron */}
                    <span>{link.label}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 pt-1 pb-1">
                    {link.dropdown.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-base font-medium rounded-md hover:bg-muted"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className="block px-2 py-3 text-base font-medium rounded-md hover:bg-muted"
                >
                  {link.label}
                </Link>
              </SheetClose>
            )
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
