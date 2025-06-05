
import { PageHeader } from '@/components/page-header';
import { mockBoardMembers } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle, Users, Mail } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function VorstandPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Der Vorstand des AC Warendorf e. V." />
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="h-7 w-7 mr-3 text-primary" />
            Unsere Vorstandsmitglieder
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {mockBoardMembers.length} Mitglieder
          </span>
        </CardHeader>
        <CardContent>
          {mockBoardMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockBoardMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col rounded-lg"
                >
                  <div className="relative w-full aspect-square">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="person photo"
                        className="rounded-t-lg" 
                        sizes="(max-width: 639px) 90vw, (max-width: 767px) 45vw, 30vw"
                        quality={90}
                        priority={index < 3} 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                        <UserCircle className="h-32 w-32 text-primary opacity-60" />
                      </div>
                    )}
                  </div>

                  <Separator className="my-0 flex-shrink-0" />

                  <div className="p-4 text-center flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {member.slug ? (
                           <Link href={`/vorstand/${member.slug}`} className="hover:text-primary hover:underline">
                            {member.name}
                          </Link>
                        ) : (
                          member.name
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                    </div>
                    {member.slug && (
                      <Button variant="link" size="sm" asChild className="mt-auto text-xs text-primary">
                        <Link href={`/vorstand/${member.slug}`}>Profil ansehen</Link>
                      </Button>
                    )}
                  </div>
                </Card>
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
        <h2 className="text-2xl font-headline font-semibold text-primary mb-3">Mitwirken und Kontakt</h2>
        <p className="text-foreground mb-4">
          Unser Vorstandsteam engagiert sich ehrenamtlich für die Belange des Vereins und die Förderung des Motorsports in Warendorf. 
          Bei Fragen zu Mitgliedschaft, Veranstaltungen oder anderen Themen rund um den AC Warendorf stehen Ihnen unsere Vorstandsmitglieder gerne zur Verfügung.
        </p>
        <p className="text-foreground">
          Die Kontaktaufnahme ist am einfachsten per E-Mail über die einzelnen Profilseiten oder über unser allgemeines <Link href="/kontakt" className="text-primary hover:underline">Kontaktformular</Link>.
        </p>
      </section>
    </div>
  );
}
