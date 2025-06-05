
import { PageHeader } from '@/components/page-header';
import { mockPilots } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Users } from 'lucide-react';
import Image from 'next/image';

export default function PilotenPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Unsere Pilot*innen" subtitle="Die aktiven Fahrerinnen und Fahrer des AC Warendorf" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="h-7 w-7 mr-3 text-primary" />
            Aktive Talente
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {mockPilots.length} Pilot*innen
          </span>
        </CardHeader>
        <CardContent>
          {mockPilots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockPilots.map((pilot) => (
                <Card 
                  key={pilot.id} 
                  className="text-center p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center"
                >
                  {pilot.imageUrl ? (
                    <Image 
                      src={pilot.imageUrl} 
                      alt={pilot.name} 
                      width={128} 
                      height={128} 
                      className="rounded-lg object-cover mb-4" 
                      data-ai-hint="pilot photo" 
                    />
                  ) : (
                    <User className="h-24 w-24 text-primary mb-4" /> // Increased size for placeholder
                  )}
                  <p className="font-semibold text-lg text-foreground mb-1">{pilot.name}</p>
                  {pilot.profileSlug ? (
                    <Button variant="link" size="sm" asChild className="mt-1 text-xs">
                      {/* Placeholder for future profile link */}
                      {/* <Link href={`/piloten/${pilot.profileSlug}`}>Profil ansehen</Link> */}
                      <span className="text-muted-foreground">(Profil demnächst)</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground mt-1">(Kein Profil)</span>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Zurzeit sind keine aktiven Pilot*innen gelistet.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="mt-12 p-6 bg-secondary rounded-lg shadow">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-3">Werde Teil unseres Teams!</h2>
        <p className="text-foreground mb-4">
          Du hast Benzin im Blut und möchtest deine Fähigkeiten im Kartsport unter Beweis stellen? 
          Der AC Warendorf bietet dir die ideale Plattform, um in den Motorsport einzusteigen und dich weiterzuentwickeln.
        </p>
        <Button asChild>
          <Link href="/kontakt/mitglied-werden">Erfahre mehr über die Mitgliedschaft</Link>
        </Button>
      </section>
    </div>
  );
}
