
import { PageHeader } from '@/components/page-header';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AktivitaetenPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Aktivitäten im AC Warendorf" />

      <Card className="shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Kart-Slalom: Unsere Hauptaktivität</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">
            Zur Zeit konzentriert sich der AC Warendorf e.V. auf den <strong>Kart-Slalom</strong>. Diese spannende und anspruchsvolle Disziplin ist der perfekte Einstieg in den Motorsport für Kinder und Jugendliche.
          </p>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Image 
                src="/images/general/kart_in_dry.jpg" 
                alt="Kart-Slalom Aktion" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-md"
                data-ai-hint="karting action"
              />
            </div>
            <div className="space-y-3">
              <p className="text-foreground">
                Im Kart-Slalom geht es darum, einen mit Pylonen abgesteckten Parcours möglichst schnell und fehlerfrei zu durchfahren. Dabei werden wichtige Fähigkeiten wie Fahrzeugbeherrschung, Konzentration und Reaktionsschnelligkeit trainiert.
              </p>
              <p className="text-foreground">
                Unsere jungen Talente nehmen regelmäßig an regionalen und überregionalen Wettbewerben teil und haben dabei schon beachtliche Erfolge erzielt.
              </p>
              <Button asChild variant="link" className="text-primary px-0">
                <Link href="/kontakt/mitglied-werden">Mehr zum Kart-Slalom und Mitgliedschaft erfahren</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional: YouTube Video */}
      <section className="py-6">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4 text-center">Kart-Slalom in Aktion</h2>
        <p className="text-center text-muted-foreground mb-6">Sehen Sie hier ein Beispielvideo, um einen Eindruck vom Kart-Slalom zu bekommen.</p>
        <YouTubeEmbed embedId="RCK5CPkfXbY" title="Karttraining AC Warendorf" />
         {/* Hinweis: Die Einbettung von YouTube-Videos unterliegt Datenschutzbestimmungen. Eine produktive Website sollte eine Zustimmungslösung implementieren. */}
      </section>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Zukünftige Möglichkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            Wenn ausreichend Interesse besteht, könnten zukünftig auch andere Motorsportarten im AC Warendorf angeboten werden. Denkbar wären beispielsweise:
          </p>
          <ul className="list-disc list-inside text-foreground mt-2 space-y-1">
            <li><strong>SimRacing:</strong> Virtueller Motorsport an professionellen Simulatoren.</li>
            <li><strong>Youngster Slalom Cup:</strong> Der nächste Schritt nach dem Kart-Slalom, mit Serienfahrzeugen auf abgesperrten Strecken.</li>
            <li><strong>Oldtimer-Ausfahrten oder -Treffen:</strong> Für Liebhaber klassischer Fahrzeuge.</li>
          </ul>
          <p className="text-foreground mt-4">
            Haben Sie Interesse an einer dieser oder anderer Motorsportdisziplinen? Sprechen Sie uns gerne an!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
