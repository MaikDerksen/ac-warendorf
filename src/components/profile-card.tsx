
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { Separator } from './ui/separator';

interface ProfileCardProps {
  name: string;
  imageUrl?: string;
  slug?: string;
  slugPrefix?: string;
  details?: string;
}

export function ProfileCard({ name, imageUrl, slug, slugPrefix, details }: ProfileCardProps) {
  const linkHref = (slug && slugPrefix) ? `${slugPrefix}${slug}` : undefined;

  const content = (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col h-full rounded-lg">
      <div className="relative w-full aspect-square bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 639px) 90vw, (max-width: 767px) 45vw, 30vw"
            quality={90}
            data-ai-hint="person photo"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle className="h-32 w-32 text-primary-foreground-alt opacity-60" />
          </div>
        )}
      </div>

      <Separator className="my-0 flex-shrink-0" />

      <div className="p-4 text-center flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {linkHref ? (
              <Link href={linkHref} className="hover:text-primary-foreground-alt hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          {details && <p className="text-sm text-muted-foreground mb-2">{details}</p>}
        </div>
        {linkHref && (
          <Button variant="link" size="sm" asChild className="mt-auto text-xs text-primary-foreground-alt">
            <Link href={linkHref}>Profil ansehen</Link>
          </Button>
        )}
      </div>
    </Card>
  );

  return linkHref ? <Link href={linkHref} className="block h-full group">{content}</Link> : <div className="h-full">{content}</div>;
}
