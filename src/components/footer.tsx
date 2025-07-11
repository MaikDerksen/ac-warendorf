import Link from 'next/link';
import { Youtube, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-12 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Automobilclub Warendorf e. V.</h3>
            <p className="text-sm">
              Ihr Ansprechpartner für Kartslalom und Motorsport in Warendorf.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Nützliche Links</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/impressum" className="hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link href="/kontakt" className="hover:text-primary transition-colors">Kontakt</Link></li>
              <li><a href="https://www.adac.de" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ADAC e.V.</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Folgen Sie uns</h3>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/channel/UCrFTrQjUMHAR7qmUh0DoAEg" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-primary transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/ac_warendorf/?hl=de" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Automobilclub Warendorf e. V. Alle Rechte vorbehalten.</p>
          <p className="mt-1">Diese Website verwendet Cookies und Dienste von Drittanbietern.</p>
        </div>
      </div>
    </footer>
  );
}
