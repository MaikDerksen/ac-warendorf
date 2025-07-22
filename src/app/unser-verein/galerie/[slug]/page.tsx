
import { getNewsArticleBySlug } from '@/lib/data-loader';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { ImageLightbox } from '@/components/image-lightbox';
import { notFound } from 'next/navigation';

interface GalleryDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const article = await getNewsArticleBySlug(params.slug);
  
  if (!article || !article.galleryImageUrls || article.galleryImageUrls.length === 0) {
    notFound();
  }
  
  const formattedDate = new Date(article.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <ImageLightbox images={article.galleryImageUrls} />
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
                  // The lightbox component now handles its own state
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
