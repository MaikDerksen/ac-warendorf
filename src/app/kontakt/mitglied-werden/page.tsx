
import { PageHeader } from '@/components/page-header';
import { getMitgliedWerdenPageContent, getAllFaqItems } from '@/lib/data-loader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle, Users, Trophy, ShieldCheck, Euro, Sparkles } from 'lucide-react';
import type { MitgliedWerdenPageContent, FaqItem } from '@/types';

const iconMap: { [key: string]: React.ElementType } = {
  faq1: HelpCircle,
  faq2: Users,
  faq3: Trophy,
  faq4: ShieldCheck,
  faq5: Euro,
  faq6: Sparkles,
};


export default async function MitgliedWerdenPage() {
  const content: MitgliedWerdenPageContent = await getMitgliedWerdenPageContent();
  const faqItems: FaqItem[] = content.faqItems || await getAllFaqItems();

  return (
    <div className="space-y-12">
      <PageHeader 
        title={content.pageTitle || "Mitglied werden im Kart-Slalom Team"} 
        subtitle={content.pageSubtitle || "Alle wichtigen Informationen für den Einstieg"} 
      />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary" dangerouslySetInnerHTML={{ __html: content.faqSectionTitle || "Häufig gestellte Fragen (FAQ)" }} />
            </CardHeader>
            <CardContent>
              {faqItems.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item) => {
                    const IconComponent = iconMap[item.icon || item.id] || HelpCircle;
                    return (
                      <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-accent" />
                            <span className="font-medium text-base" dangerouslySetInnerHTML={{ __html: item.question }} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                 <p className="text-muted-foreground">Momentan sind keine FAQs verfügbar.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary" dangerouslySetInnerHTML={{ __html: content.whatIsKartSlalomTitle || "Was ist Kartslalom?"}} />
            </CardHeader>
            <CardContent className="space-y-4">
              {content.whatIsKartSlalomText && <p className="text-foreground" dangerouslySetInnerHTML={{__html: content.whatIsKartSlalomText }} />}
              {content.wikipediaLinkUrl && content.wikipediaLinkText && (
                <p className="text-sm text-muted-foreground">
                  Quelle: <a href={content.wikipediaLinkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" dangerouslySetInnerHTML={{ __html: content.wikipediaLinkText}}/>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6 sticky top-24">
            <Card className="shadow-lg bg-secondary">
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary" dangerouslySetInnerHTML={{ __html: content.sidebarTitle || "Interesse geweckt?"}} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Image 
                      src={content.imageUrl || "/images/general/kart_in_dry.jpg"} 
                      alt="Kinder beim Kartfahren" 
                      width={400} 
                      height={250} 
                      className="rounded-lg shadow-md w-full"
                      data-ai-hint="kids karting" 
                    />
                    {content.sidebarText && <p className="text-foreground" dangerouslySetInnerHTML={{ __html: content.sidebarText }} />}
                    <Button asChild className="w-full">
                        <Link href={content.sidebarButtonLink || "/kontakt"}>{content.sidebarButtonText || "Jetzt Kontakt aufnehmen!"}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    