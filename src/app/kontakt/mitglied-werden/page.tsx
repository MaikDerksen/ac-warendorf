import { PageHeader } from '@/components/page-header';
import { mockFaqItems } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle, Users, Trophy, ShieldCheck, Euro, Sparkles } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  faq1: HelpCircle,
  faq2: Users,
  faq3: Trophy,
  faq4: ShieldCheck,
  faq5: Euro,
  faq6: Sparkles,
};


export default function MitgliedWerdenPage() {
  return (
    <div className="space-y-12">
      <PageHeader title="Mitglied werden im Kart-Slalom Team" subtitle="Alle wichtigen Informationen für den Einstieg" />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Häufig gestellte Fragen (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {mockFaqItems.map((item) => {
                  const IconComponent = iconMap[item.id] || HelpCircle;
                  return (
                    <AccordionItem value={item.id} key={item.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-accent" />
                          <span className="font-medium text-base">{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground/90 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Was ist Kartslalom?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                "Kartslalom ist die Breitensportvariante des Kartsports. Es wird auf großen Parkplätzen, Industrieflächen oder ähnlichen befestigten ebenen Flächen ausgetragen. Die Strecke wird hierbei mit Pylonen markiert. Ziel ist es, die Strecke möglichst schnell und fehlerfrei zu absolvieren. Für das Umwerfen oder Verschieben von Pylonen aus ihrer Markierung gibt es Strafsekunden, welche zur Fahrzeit addiert werden."
              </p>
              <p className="text-sm text-muted-foreground">
                Quelle: <a href="https://de.wikipedia.org/wiki/Kartslalom" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Wikipedia - Kartslalom</a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6 sticky top-24">
            <Card className="shadow-lg bg-secondary">
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">Interesse geweckt?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Image 
                      src="/images/general/kart_in_dry.jpg" 
                      alt="Kinder beim Kartfahren" 
                      width={400} 
                      height={250} 
                      className="rounded-lg shadow-md w-full"
                      data-ai-hint="kids karting" 
                    />
                    <p className="text-foreground">
                        Kart-Slalom ist ein faszinierender und sicherer Einstieg in die Welt des Motorsports. Es fördert Konzentration, Geschicklichkeit und Teamgeist.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/kontakt">Jetzt Kontakt aufnehmen!</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
