
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllSponsors } from '@/lib/data-loader';
import type { Sponsor } from '@/types';

export default async function SponsorenPage() {
  const sponsors = await getAllSponsors();

  return (
    <div className="space-y-8">
      <PageHeader title="Unsere Sponsoren" subtitle="Wir danken unseren Unterstützern!" />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Ein herzliches Dankeschön!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">
            Der AC Warendorf e.V. im ADAC bedankt sich herzlich bei allen Sponsoren, Partnern und Gönnern für ihre wertvolle Unterstützung. Ohne Sie wäre unsere vielfältige Vereinsarbeit, insbesondere die Förderung des Kart-Slalom-Nachwuchses, nicht in diesem Umfang möglich.
          </p>
          <p className="text-foreground">
            Ihre Beiträge ermöglichen es uns, Trainingsmaterial anzuschaffen, Veranstaltungen durchzuführen und unseren jungen Talenten eine Perspektive im Motorsport zu bieten.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Unsere Partner</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch text-center">
          {sponsors.length > 0 ? sponsors.map((sponsor: Sponsor) => (
            <div key={sponsor.id} className="flex flex-col items-center justify-between p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-full h-20 mb-3">
                <Image 
                  src={sponsor.logoUrl} 
                  alt={`${sponsor.name} Logo`} 
                  layout="fill" 
                  objectFit="contain" 
                  className="mb-2" 
                  data-ai-hint={sponsor.dataAiHint || "company logo"}
                />
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium text-foreground">{sponsor.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{sponsor.level}</p>
                {sponsor.websiteUrl && (
                  <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">Webseite besuchen</a>
                  </Button>
                )}
              </div>
            </div>
          )) : (
            <p className="col-span-full text-muted-foreground">Aktuell sind keine Sponsoren gelistet.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg bg-secondary">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Werden auch Sie Sponsor!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            Möchten Sie den lokalen Motorsport fördern und Ihr Unternehmen in einem dynamischen Umfeld präsentieren? 
            Wir bieten verschiedene Sponsoring-Möglichkeiten und freuen uns über Ihr Interesse.
          </p>
          <Button asChild>
            <Link href="/kontakt">Jetzt Kontakt aufnehmen</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
