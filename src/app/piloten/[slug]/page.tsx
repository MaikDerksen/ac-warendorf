
import { getPilotBySlug, getAllPilots } from '@/lib/data-loader'; // getAllPilots now from Firestore
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

export async function generateStaticParams() {
  const pilots = await getAllPilots(); // Fetches from Firestore
  return pilots
    .filter(pilot => pilot.profileSlug)
    .map((pilot) => ({
      slug: pilot.profileSlug!,
    }));
}

export default async function PilotProfilePage({ params }: PilotProfilePageProps) {
  const pilot = await getPilotBySlug(params.slug); // Fetches from Firestore

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
                    fill // Next 13+ style
                    style={{ objectFit: 'cover' }}
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
              {pilot.bio ? (
                <p>{pilot.bio}</p>
              ) : (
                <p>Weitere Details zu {pilot.name} folgen in Kürze.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Trophy className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Meine Erfolge</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-foreground">
              {pilot.achievements && pilot.achievements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {pilot.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              ) : (
                <p>Informationen zu Erfolgen werden bald ergänzt.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
