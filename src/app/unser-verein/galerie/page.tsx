
import { PageHeader } from '@/components/page-header';
import { getCombinedGalleryAlbums } from '@/lib/data-loader';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Images } from 'lucide-react';

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function GaleriePage() {
  const galleryAlbums = await getCombinedGalleryAlbums();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Bildergalerie" 
        subtitle="Sammlungen von unseren Veranstaltungen und Renntagen."
      />

      {galleryAlbums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryAlbums.map((album) => {
            const formattedDate = new Date(album.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const coverImage = album.coverImageUrl || "https://placehold.co/400x400.png";
            const linkHref = album.type === 'news'
              ? `/unser-verein/galerie/${album.slug}`
              : `/unser-verein/galerie/album/${album.id}`;

            return (
              <Link href={linkHref} key={album.id} className="group block">
                <Card className="overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col h-full">
                  <div className="relative w-full aspect-square bg-muted">
                    <Image
                      src={coverImage}
                      alt={`Titelbild für ${album.title}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 22vw"
                      data-ai-hint="race day gallery"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                  <CardContent className="p-4 bg-card flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {album.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Images className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">Noch keine Galerien vorhanden</h3>
            <p>Sobald News-Artikeln Bildergalerien hinzugefügt oder manuelle Alben erstellt werden, erscheinen sie hier.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
