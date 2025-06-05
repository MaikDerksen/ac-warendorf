import Link from 'next/link';
import Image from 'next/image';
import type { NewsArticle } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Tag } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const formattedDate = new Date(article.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out">
      <CardHeader className="p-0">
        {article.heroImageUrl && (
          <Link href={`/news/${article.slug}`} className="block aspect-video relative">
            <Image
              src={article.heroImageUrl}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={article.dataAiHint || "news article image"}
            />
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl mb-2 font-headline">
          <Link href={`/news/${article.slug}`} className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{article.excerpt}</p>
        <div className="text-xs text-muted-foreground flex items-center space-x-2 mb-1">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        {article.categories && article.categories.length > 0 && (
          <div className="text-xs text-muted-foreground flex items-center space-x-1">
            <Tag className="h-3.5 w-3.5" />
            <span>{article.categories.join(', ')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground">
          <Link href={`/news/${article.slug}`}>Weiterlesen</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
