
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  logoUrl?: string; // Make logoUrl optional
  secondaryTextColor?: string;
}

const PLACEHOLDER_LOGO_SMALL = "https://placehold.co/80x80.png";

export function Logo({ logoUrl, secondaryTextColor = "text-foreground/80" }: LogoProps) {
  const displayLogoUrl = logoUrl || PLACEHOLDER_LOGO_SMALL;

  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors">
      <div className="relative h-10 w-10 sm:h-12 sm:w-12">
        <Image 
          src={displayLogoUrl} 
          alt="AC Warendorf Logo" 
          fill // Use fill for Next 13+ Image component
          style={{ objectFit: 'contain' }} // Use style for objectFit
          data-ai-hint="club logo" 
          priority // Assuming logo is important for LCP
        />
      </div>
      <div className="flex flex-col">
        <span className="font-headline text-xl sm:text-2xl font-bold leading-tight">AC Warendorf</span>
        <span className={`text-xs sm:text-sm ${secondaryTextColor} leading-tight`}>Automobilclub e.V.</span>
      </div>
    </Link>
  );
}
