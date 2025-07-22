
'use client';

import { getManualAlbumById } from '@/lib/data-loader';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, ArrowLeft, Loader2 } from 'lucide-react';
import * as React from 'react';
import { ImageLightbox } from '@/components/image-lightbox';
import type { PhotoAlbum } from '@/types';

interface AlbumDetailPageProps {
  params: {
    albumId: string;
  };
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const [album, setAlbum] = React.useState<PhotoAlbum | null | undefined>(undefined);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      const fetchedAlbum = await getManualAlbumById(params.albumId);
      setAlbum(fetchedAlbum);
    }
    fetchData();
  }, [params.albumId]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  if (album === undefined) {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Lade Album...</span>
        </div>
    );
  }

  if (album === null || !album.imageUrls || album.imageUrls.length === 0) {
    return (
        <div className="space-y-8">
             <PageHeader title="Album nicht gefunden" />
             <p className="text-center text-muted-foreground">Das angeforderte Album konnte nicht gefunden werden oder enthält keine Bilder.</p>
              <div className="text-center">
                <Button asChild variant="outline">
                    <Link href="/unser-verein/galerie">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Zurück zur Galerie-Übersicht
                    </Link>
                </Button>
              </div>
        </div>
    );
  }

  const formattedDate = new Date(album.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {lightboxOpen && (
        <ImageLightbox
          images={album.imageUrls}
          startIndex={selectedImageIndex}
          onClose={closeLightbox}
        />
      )}

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
                  onClick={() => openLightbox(index)}
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
