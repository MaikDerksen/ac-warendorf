
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SponsorenPage() {
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

      {/* Placeholder for sponsor logos/listings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Unsere Partner (Beispiele)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center text-center">
          {/* Replace with actual sponsor data and logos */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Image src="/images/sponsoren/sponsor-placeholder-1.png" alt="Sponsor Logo 1" width={150} height={80} className="mb-2" data-ai-hint="company logo"/>
            <p className="text-sm font-medium text-foreground">Lokales Unternehmen WAF</p>
            <p className="text-xs text-muted-foreground">Hauptsponsor</p>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Image src="/images/sponsoren/sponsor-placeholder-2.png" alt="Sponsor Logo 2" width={150} height={80} className="mb-2" data-ai-hint="business logo"/>
            <p className="text-sm font-medium text-foreground">Mustermann GmbH</p>
            <p className="text-xs text-muted-foreground">Premium Partner</p>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Image src="/images/sponsoren/sponsor-placeholder-3.png" alt="Sponsor Logo 3" width={150} height={80} className="mb-2" data-ai-hint="brand icon"/>
            <p className="text-sm font-medium text-foreground">KFZ-Service Meier</p>
            <p className="text-xs text-muted-foreground">Unterstützer</p>
          </div>
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
