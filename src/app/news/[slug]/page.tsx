
import { getNewsArticleBySlug, getAllNewsArticles } from '@/lib/data-loader';
import type { NewsArticle } from '@/types';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { CalendarDays, Tag } from 'lucide-react'; // Removed Share2 as it's commented out
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const articles = await getAllNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

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
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-8">
          <Image
            src={article.heroImageUrl}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint={article.dataAiHint || "news detail image"}
          />
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
      
      {/* Optional Social Sharing Buttons - Placeholder */}
      {/* 
      <section className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-3 font-headline">Artikel teilen</h3>
        <div className="flex space-x-3">
          <Button variant="outline" size="icon" aria-label="Auf Facebook teilen">
            <Share2 className="h-5 w-5" /> Facebook (TODO)
          </Button>
          <Button variant="outline" size="icon" aria-label="Auf Twitter teilen">
            <Share2 className="h-5 w-5" /> Twitter (TODO)
          </Button>
        </div>
      </section>
      */}

      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link href="/news">Zurück zum News-Archiv</Link>
        </Button>
      </div>
    </article>
  );
}
