
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Only Card, CardContent etc. removed if not used directly
import { NewsCard } from '@/components/news-card';
import { PageHeader } from '@/components/page-header';
import { getAllNewsArticles, getAllBoardMembers, getSiteSettings } from '@/lib/data-loader';
import type { BoardMember, SiteSettings } from '@/types';
import { Mail, UserCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default async function HomePage() {
  const allNews = await getAllNewsArticles();
  const latestNews = allNews.slice(0, 3);
  
  const allBoardMembers = await getAllBoardMembers(); // Fetches all, sorted by order, then name
  const siteSettings: SiteSettings = await getSiteSettings();

  // Display the first 4 board members based on the default sorting (order, then name)
  const contactPersons = allBoardMembers.slice(0, 4);

  const renderContactPersonCard = (person: BoardMember) => {
    const cardContent = (
      <Card className="shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out w-full h-full flex flex-col sm:flex-row items-center p-4">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 mb-4 sm:mb-0">
          {person.imageUrl ? (
            <Image
              src={person.imageUrl}
              alt={person.name}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
              data-ai-hint="person photo"
              sizes="(max-width: 640px) 24vw, (max-width: 768px) 28vw, 112px"
            />
          ) : (
            <UserCircle className="w-full h-full text-primary opacity-60 rounded-lg" />
          )}
        </div>
        
        <div className="hidden sm:flex flex-shrink-0 items-center justify-center px-4">
          <div className="h-16 w-px bg-border"></div>
        </div>

        <div className="flex-grow text-center sm:text-left">
          <h3 className="text-xl font-headline font-semibold text-primary mb-1">{person.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{person.role}</p>
          {person.slug ? (
            <div className="text-sm text-primary hover:underline flex items-center justify-center sm:justify-start cursor-pointer">
              <Mail className="h-4 w-4 mr-2" />
              {person.email.replace('[at]', '@')} (Profil)
            </div>
          ) : (
            <a
              href={`mailto:${person.email.replace('[at]', '@')}`}
              className="text-sm text-primary hover:underline flex items-center justify-center sm:justify-start"
            >
              <Mail className="h-4 w-4 mr-2" />
              {person.email.replace('[at]', '@')}
            </a>
          )}
        </div>
      </Card>
    );

    if (person.slug) {
      return (
        <Link key={person.id} href={`/vorstand/${person.slug}`} className="block h-full group">
          {cardContent}
        </Link>
      );
    }
    return (
      <div key={person.id} className="h-full">
        {cardContent}
      </div>
    );
  };

  return (
    <div className="space-y-16">
      <section 
        className="relative text-center py-12 md:py-20 rounded-lg shadow-md dark:border dark:border-border overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${siteSettings.homepageHeroImageUrl || '/images/general/kart_in_dry.jpg'})` }}
        data-ai-hint="karting race track"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <Logo logoUrl={siteSettings.logoUrl} secondaryTextColor="text-gray-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-headline">
            Herzlich willkommen beim Automobilclub Warendorf.
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto mb-8">
            Hier finden Sie alle Informationen rund um die Aktivitäten des AC Warendorf e. V. im ADAC.
            Entdecken Sie unsere Leidenschaft für den Motorsport!
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/kontakt/mitglied-werden">Mitglied werden</Link>
          </Button>
        </div>
      </section>

      <section>
        <PageHeader title="Neueste Nachrichten" />
        {latestNews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
           <p className="text-center text-muted-foreground py-6">
             Zurzeit sind keine aktuellen Nachrichten vorhanden.
           </p>
        )}
        {allNews.length > 3 && (
           <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/news">Alle Nachrichten anzeigen</Link>
            </Button>
          </div>
        )}
         {allNews.length === 0 && latestNews.length === 0 && (
           <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/news">Zum Nachrichtenarchiv</Link>
            </Button>
          </div>
        )}
      </section>

      {contactPersons.length > 0 && (
        <section>
          <PageHeader title="Ihre Ansprechpartner" />
          <div className="grid md:grid-cols-2 gap-6">
            {contactPersons.map((person) => renderContactPersonCard(person))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/vorstand">Gesamten Vorstand anzeigen</Link>
            </Button>
          </div>
        </section>
      )}

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

    