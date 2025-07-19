import Link from 'next/link';
import { Youtube, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12 py-8 border-t dark:bg-secondary dark:text-secondary-foreground dark:border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Automobilclub Warendorf e. V.</h3>
            <p className="text-sm opacity-90">
              Ihr Ansprechpartner für Kartslalom und Motorsport in Warendorf.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Nützliche Links</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/impressum" className="opacity-90 hover:opacity-100 transition-opacity">Impressum</Link></li>
              <li><Link href="/datenschutz" className="opacity-90 hover:opacity-100 transition-opacity">Datenschutz</Link></li>
              <li><Link href="/kontakt" className="opacity-90 hover:opacity-100 transition-opacity">Kontakt</Link></li>
              <li><a href="https://www.adac.de" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">ADAC e.V.</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-2">Folgen Sie uns</h3>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/channel/UCrFTrQjUMHAR7qmUh0DoAEg" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="opacity-90 hover:opacity-100 transition-opacity">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/ac_warendorf/?hl=de" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-90 hover:opacity-100 transition-opacity">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 dark:border-border pt-6 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} Automobilclub Warendorf e. V. Alle Rechte vorbehalten.</p>
          <p className="mt-1">Diese Website verwendet Cookies und Dienste von Drittanbietern.</p>
        </div>
      </div>
    </footer>
  );
}
