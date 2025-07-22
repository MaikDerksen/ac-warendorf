
'use client';

import { getNewsArticleBySlug } from '@/lib/data-loader';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, ArrowLeft, Loader2 } from 'lucide-react';
import * as React from 'react';
import { ImageLightbox } from '@/components/image-lightbox';
import type { NewsArticle } from '@/types';

interface GalleryDetailPageProps {
  params: {
    slug: string;
  };
}

export default function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const [article, setArticle] = React.useState<NewsArticle | null | undefined>(undefined);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
        const fetchedArticle = await getNewsArticleBySlug(params.slug);
        setArticle(fetchedArticle);
    }
    fetchData();
  }, [params.slug]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  if (article === undefined) {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Lade Galerie...</span>
        </div>
    );
  }

  if (article === null || !article.galleryImageUrls || article.galleryImageUrls.length === 0) {
    return (
        <div className="space-y-8">
             <PageHeader title="Galerie nicht gefunden" />
             <p className="text-center text-muted-foreground">Die angeforderte Galerie konnte nicht gefunden werden oder enthält keine Bilder.</p>
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
  
  const formattedDate = new Date(article.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {lightboxOpen && article.galleryImageUrls && (
        <ImageLightbox
          images={article.galleryImageUrls}
          startIndex={selectedImageIndex}
          onClose={closeLightbox}
        />
      )}
      <div className="space-y-8">
        <PageHeader 
          title={article.title}
          subtitle={
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>Galerie vom {formattedDate}</span>
            </div>
          }
        />

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {article.galleryImageUrls.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={`${article.title} - Bild ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 22vw"
                    data-ai-hint="karting event photo"
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
