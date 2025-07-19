
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  logoUrl?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
}

const PLACEHOLDER_LOGO_SMALL = "https://placehold.co/80x80.png";

export function Logo({ 
  logoUrl, 
  primaryTextColor, 
  secondaryTextColor
}: LogoProps) {
  const displayLogoUrl = logoUrl || PLACEHOLDER_LOGO_SMALL;

  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="relative h-10 w-10 sm:h-12 sm:w-12">
        <Image 
          src={displayLogoUrl} 
          alt="AC Warendorf Logo" 
          fill
          style={{ objectFit: 'contain' }}
          data-ai-hint="club logo" 
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "font-headline text-xl sm:text-2xl font-bold leading-tight transition-colors group-hover:opacity-90",
          primaryTextColor || "text-foreground"
        )}>
          AC Warendorf
        </span>
        <span className={cn(
          "text-xs sm:text-sm leading-tight transition-colors",
          secondaryTextColor || "text-muted-foreground"
        )}>
          Automobilclub e.V.
        </span>
      </div>
    </Link>
  );
}
