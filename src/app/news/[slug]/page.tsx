
import { getNewsArticleBySlug } from '@/lib/data-loader';
import type { NewsArticle } from '@/types';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { CalendarDays, Tag, Newspaper, Images } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageLightbox } from '@/components/image-lightbox';
import { notFound } from 'next/navigation';

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

// This is now an async Server Component
export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const article = await getNewsArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
     {article.galleryImageUrls && article.galleryImageUrls.length > 0 && (
        <ImageLightbox
          images={article.galleryImageUrls}
        />
      )}
    <article className="max-w-4xl mx-auto space-y-8">
      <PageHeader title={article.title} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>Veröffentlicht am {formattedDate}</span>
        </div>
        {article.categories && article.categories.length > 0 && (
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            <span>{article.categories.join(', ')}</span>
          </div>
        )}
      </div>

      {article.heroImageUrl && !article.youtubeEmbed && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-8 bg-muted">
          <Image
            src={article.heroImageUrl}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint={article.dataAiHint || "news detail image"}
          />
        </div>
      )}

      {!article.heroImageUrl && !article.youtubeEmbed && (
         <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-8 bg-muted flex items-center justify-center">
            <Newspaper className="h-32 w-32 text-primary-foreground-alt opacity-20" />
        </div>
      )}

      {article.youtubeEmbed && (
        <YouTubeEmbed embedId={article.youtubeEmbed} title={article.title} />
      )}

      <Card className="shadow-lg">
        <CardContent className="prose prose-lg max-w-none p-6 md:p-8 text-foreground">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </CardContent>
      </Card>
      
      {article.galleryImageUrls && article.galleryImageUrls.length > 0 && (
        <section>
          <Separator className="my-8" />
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
            <Images className="mr-3 h-6 w-6 text-primary-foreground-alt" />
            Bildergalerie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {article.galleryImageUrls.map((url, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden shadow-md group cursor-pointer"
                // The lightbox component now handles its own state when clicked
              >
                <Image
                  src={url}
                  alt={`Galeriebild ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 767px) 45vw, 22vw"
                  data-ai-hint="race day photo"
                />
              </div>
            ))}
          </div>
        </section>
      )}


      {article.categories && article.categories.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3 font-headline">Kategorien</h3>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-sm">{category}</Badge>
            ))}
          </div>
        </section>
      )}
      
      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link href="/news">Zurück zum News-Archiv</Link>
        </Button>
      </div>
    </article>
    </>
  );
}
