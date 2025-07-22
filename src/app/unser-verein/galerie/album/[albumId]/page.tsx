
import { getManualAlbumById } from '@/lib/data-loader';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { ImageLightbox } from '@/components/image-lightbox';
import { notFound } from 'next/navigation';

interface AlbumDetailPageProps {
  params: {
    albumId: string;
  };
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const album = await getManualAlbumById(params.albumId);

  if (!album || !album.imageUrls || album.imageUrls.length === 0) {
    notFound();
  }

  const formattedDate = new Date(album.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <ImageLightbox images={album.imageUrls} />

      <div className="space-y-8">
        <PageHeader 
          title={album.name}
          subtitle={
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>Album vom {formattedDate}</span>
            </div>
          }
        />

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {album.imageUrls.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md group cursor-pointer"
                  // The lightbox component now handles its own state
                >
                  <Image
                    src={imageUrl}
                    alt={`${album.name} - Bild ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 22vw"
                    data-ai-hint="gallery photo"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button asChild variant="outline">
              <Link href="/unser-verein/galerie">
                  <ArrowLeft className="mr-2 h-4 w-4"/>
                  Zurück zur Galerie-Übersicht
              </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
