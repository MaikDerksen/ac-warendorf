
import { mockPilots } from '@/lib/mock-data';
import type { Pilot } from '@/types';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Trophy, Info } from 'lucide-react';

interface PilotProfilePageProps {
  params: {
    slug: string;
  };
}

async function getPilot(slug: string): Promise<Pilot | undefined> {
  return mockPilots.find((pilot) => pilot.profileSlug === slug);
}

export async function generateStaticParams() {
  return mockPilots
    .filter(pilot => pilot.profileSlug)
    .map((pilot) => ({
      slug: pilot.profileSlug!,
    }));
}

export default async function PilotProfilePage({ params }: PilotProfilePageProps) {
  const pilot = await getPilot(params.slug);

  if (!pilot) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <PageHeader title={pilot.name} />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative w-full aspect-square">
                {pilot.imageUrl ? (
                  <Image
                    src={pilot.imageUrl}
                    alt={pilot.name}
                    layout="fill"
                    objectFit="cover"
                    priority
                    sizes="(max-width: 767px) 90vw, 30vw"
                    data-ai-hint="pilot photo"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-32 w-32 text-primary opacity-60" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <h2 className="text-2xl font-headline text-primary">{pilot.name}</h2>
              {/* Placeholder for age/class if available */}
              {/* <p className="text-sm text-muted-foreground">Klasse K2</p> */}
            </CardContent>
          </Card>
           <Button asChild variant="outline" className="w-full">
            <Link href="/piloten">Zurück zur Pilotenübersicht</Link>
          </Button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Über Mich</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-foreground">
              {/* Add more specific details to mockPilots if needed */}
              <p>
                Hallo! Ich bin {pilot.name} und fahre leidenschaftlich gerne Kart-Slalom für den AC Warendorf.
                Der Motorsport fasziniert mich schon seit meiner Kindheit.
              </p>
              <p>
                Disziplin, Konzentration und der Nervenkitzel auf der Strecke sind das, was mich antreibt.
                Mein Ziel ist es, mich stetig zu verbessern und den Verein erfolgreich zu vertreten.
              </p>
              {/* Example: <p>{pilot.bio || "Weitere Details folgen in Kürze."}</p> */}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Trophy className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Meine Erfolge (Beispiele)</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>Weltmeister Kart-Slalom 2024 (laut News)</li>
                <li>Mehrfacher Vereinsmeister AC Warendorf</li>
                <li>Podiumsplätze bei ADAC Westfalen-Läufen</li>
                <li>Teilnahme an der Deutschen Meisterschaft</li>
                {/* Example: {pilot.achievements?.map(ach => <li key={ach}>{ach}</li>) || "Weitere Details folgen."} */}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
