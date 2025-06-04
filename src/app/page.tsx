
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsCard } from '@/components/news-card';
import { PageHeader } from '@/components/page-header';
import { mockNewsArticles, mockBoardMembers } from '@/lib/mock-data';
import { Mail, UserCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function HomePage() {
  const latestNews = mockNewsArticles.slice(0, 3);
  const contactPersons = mockBoardMembers.filter(member => ['1. Vorsitzender', 'Webmaster', 'Sportleiterin', 'Jugendleiter'].includes(member.role));

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 bg-card rounded-lg shadow-md dark:border dark:border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-headline">
            Herzlich willkommen beim Automobilclub Warendorf.
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-8">
            Hier finden Sie alle Informationen rund um die Aktivitäten des AC Warendorf e. V. im ADAC.
            Entdecken Sie unsere Leidenschaft für den Motorsport!
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/kontakt/mitglied-werden">Mitglied werden</Link>
          </Button>
        </div>
      </section>

      {/* Neueste Nachrichten */}
      <section>
        <PageHeader title="Neueste Nachrichten" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
        {mockNewsArticles.length > 3 && (
           <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/news">Alle Nachrichten anzeigen</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Ihre Ansprechpartner */}
      <section>
        <PageHeader title="Ihre Ansprechpartner" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactPersons.map((person) => (
            <Card key={person.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <UserCircle className="h-10 w-10 text-primary" />
                  <CardTitle className="text-xl font-headline">{person.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${person.email.replace('[at]', '@')}`}
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {person.email.replace('[at]', '@')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/vorstand">Gesamten Vorstand anzeigen</Link>
          </Button>
        </div>
      </section>

      {/* Call to Action / Club Intro */}
      <section className="py-12 bg-secondary rounded-lg shadow-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4 font-headline">Engagiert im Motorsport</h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto mb-6">
            Der AC Warendorf e.V. im ADAC fördert den Motorsportnachwuchs und bietet eine Plattform für Motorsportbegeisterte jeden Alters. Erfahren Sie mehr über unsere Aktivitäten und wie Sie Teil unserer Gemeinschaft werden können.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/aktivitaeten">Unsere Aktivitäten</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/kontakt">Kontakt aufnehmen</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
