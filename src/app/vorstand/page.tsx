
import { PageHeader } from '@/components/page-header';
import { getAllBoardMembers } from '@/lib/data-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { ProfileCard } from '@/components/profile-card';

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function VorstandPage() {
  const allBoardMembers = await getAllBoardMembers();

  return (
    <div className="space-y-8">
      <PageHeader title="Der Vorstand des AC Warendorf e. V." />
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="h-7 w-7 mr-3 text-primary-foreground-alt" />
            Unsere Vorstandsmitglieder
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {allBoardMembers.length} Mitglieder
          </span>
        </CardHeader>
        <CardContent>
          {allBoardMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allBoardMembers.map((member) => (
                <ProfileCard 
                  key={member.id}
                  name={member.name}
                  imageUrl={member.imageUrl}
                  slug={member.slug}
                  slugPrefix="/vorstand/"
                  details={Array.isArray(member.roles) && member.roles.length > 0 ? member.roles.map(r => r.role).join(', ') : 'Mitglied'}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Zurzeit sind keine Vorstandsmitglieder gelistet.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="mt-12 p-6 bg-secondary rounded-lg shadow">
        <h2 className="text-2xl font-headline font-semibold text-primary-foreground-alt mb-3">Mitwirken und Kontakt</h2>
        <p className="text-foreground mb-4">
          Unser Vorstandsteam engagiert sich ehrenamtlich für die Belange des Vereins und die Förderung des Motorsports in Warendorf. 
          Bei Fragen zu Mitgliedschaft, Veranstaltungen oder anderen Themen rund um den AC Warendorf stehen Ihnen unsere Vorstandsmitglieder gerne zur Verfügung.
        </p>
        <p className="text-foreground">
          Die Kontaktaufnahme ist am einfachsten per E-Mail über die einzelnen Profilseiten oder über unser allgemeines <Link href="/kontakt" className="text-primary-foreground-alt hover:underline">Kontaktformular</Link>.
        </p>
      </section>
    </div>
  );
}
