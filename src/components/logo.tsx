
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  secondaryTextColor?: string;
}

export function Logo({ secondaryTextColor = "text-foreground/80" }: LogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors">
      <div className="relative h-10 w-10 sm:h-12 sm:w-12">
        <Image 
          src="/images/logo/logo_80px.png" 
          alt="AC Warendorf Logo" 
          layout="fill" 
          objectFit="contain"
          data-ai-hint="club logo" 
        />
      </div>
      <div className="flex flex-col">
        <span className="font-headline text-xl sm:text-2xl font-bold leading-tight">AC Warendorf</span>
        <span className={`text-xs sm:text-sm ${secondaryTextColor} leading-tight`}>Automobilclub e.V.</span>
      </div>
    </Link>
  );
}
