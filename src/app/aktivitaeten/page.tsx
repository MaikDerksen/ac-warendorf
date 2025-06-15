
import { PageHeader } from '@/components/page-header';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAktivitaetenPageContent } from '@/lib/data-loader';
import type { AktivitaetenPageContent } from '@/types';

export default async function AktivitaetenPage() {
  const content: AktivitaetenPageContent = await getAktivitaetenPageContent();

  return (
    <div className="space-y-8">
      <PageHeader title="Aktivitäten im AC Warendorf" />

      <Card className="shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary" dangerouslySetInnerHTML={{ __html: content.kartSlalomSectionTitle || "Kart-Slalom: Unsere Hauptaktivität" }} />
        </CardHeader>
        <CardContent className="space-y-4">
          {content.kartSlalomIntroParagraph && <p className="text-lg text-foreground" dangerouslySetInnerHTML={{ __html: content.kartSlalomIntroParagraph }} />}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Image 
                src={content.mainImageUrl || "https://placehold.co/600x400.png"} 
                alt="Kart-Slalom Aktion" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-md"
                data-ai-hint="karting action"
              />
            </div>
            <div className="space-y-3">
              {content.kartSlalomDetailParagraph1 && <p className="text-foreground" dangerouslySetInnerHTML={{ __html: content.kartSlalomDetailParagraph1 }} />}
              {content.kartSlalomDetailParagraph2 && <p className="text-foreground" dangerouslySetInnerHTML={{ __html: content.kartSlalomDetailParagraph2 }} />}
              <Button asChild variant="link" className="text-primary px-0">
                <Link href="/kontakt/mitglied-werden">Mehr zum Kart-Slalom und Mitgliedschaft erfahren</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {content.youtubeEmbedId && (
        <section className="py-6">
          {content.youtubeSectionTitle && <h2 className="text-2xl font-headline font-semibold text-primary mb-4 text-center" dangerouslySetInnerHTML={{ __html: content.youtubeSectionTitle }} />}
          {content.youtubeSectionText && <p className="text-center text-muted-foreground mb-6" dangerouslySetInnerHTML={{ __html: content.youtubeSectionText }} />}
          <YouTubeEmbed embedId={content.youtubeEmbedId} title={content.kartSlalomSectionTitle || "Kart-Slalom Video"} />
        </section>
      )}
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary" dangerouslySetInnerHTML={{ __html: content.futurePossibilitiesTitle || "Zukünftige Möglichkeiten"}} />
        </CardHeader>
        <CardContent>
          {content.futurePossibilitiesIntro && <p className="text-foreground" dangerouslySetInnerHTML={{ __html: content.futurePossibilitiesIntro }} />}
          {content.futurePossibilitiesItems && content.futurePossibilitiesItems.length > 0 && (
            <ul className="list-disc list-inside text-foreground mt-2 space-y-1">
              {content.futurePossibilitiesItems.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )}
          <p className="text-foreground mt-4">
            Haben Sie Interesse an einer dieser oder anderer Motorsportdisziplinen? Sprechen Sie uns gerne an!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    