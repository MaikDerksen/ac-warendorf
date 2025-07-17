
import { PageHeader } from '@/components/page-header';
import { getAllPilots } from '@/lib/data-loader'; // Now fetches from Firestore
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { ProfileCard } from '@/components/profile-card';

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function PilotenPage() {
  const allPilots = await getAllPilots(); // Fetches from Firestore

  return (
    <div className="space-y-8">
      <PageHeader title="Unsere Pilot*innen" subtitle="Die aktiven Fahrerinnen und Fahrer des AC Warendorf" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="h-7 w-7 mr-3 text-primary-foreground-alt" />
            Aktive Talente
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {allPilots.length} Pilot*innen
          </span>
        </CardHeader>
        <CardContent>
          {allPilots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allPilots.map((pilot) => (
                <ProfileCard 
                  key={pilot.id}
                  name={pilot.name}
                  imageUrl={pilot.imageUrl}
                  slug={pilot.profileSlug}
                  slugPrefix="/piloten/"
                  details="Pilot/in"
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Momentan sind keine Pilot*innen in Firestore vorhanden oder es gab ein Problem beim Laden.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="mt-12 p-6 bg-secondary rounded-lg shadow">
        <h2 className="text-2xl font-headline font-semibold text-primary-foreground-alt mb-3">Werde Teil unseres Teams!</h2>
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
