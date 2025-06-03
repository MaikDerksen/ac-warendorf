import Link from 'next/link';
import { Car } from 'lucide-react'; // Example icon

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors">
      <Car className="h-8 w-8 sm:h-10 sm:w-10" />
      <div className="flex flex-col">
        <span className="font-headline text-xl sm:text-2xl font-bold leading-tight">AC Warendorf</span>
        <span className="text-xs sm:text-sm text-foreground/80 leading-tight">Automobilclub e.V.</span>
      </div>
    </Link>
  );
}
