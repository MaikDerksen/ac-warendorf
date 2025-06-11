
import { getBoardMemberBySlug, getAllBoardMembers } from '@/lib/data-loader';
import type { BoardMember } from '@/types';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Mail, Briefcase, CalendarDays, Info } from 'lucide-react';

interface BoardMemberProfilePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const members = await getAllBoardMembers();
  return members
    .filter(member => member.slug)
    .map((member) => ({
      slug: member.slug!,
    }));
}

export default async function BoardMemberProfilePage({ params }: BoardMemberProfilePageProps) {
  const member = await getBoardMemberBySlug(params.slug);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <PageHeader title={member.name} />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative w-full aspect-square">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    layout="fill"
                    objectFit="cover"
                    priority
                    sizes="(max-width: 767px) 90vw, 30vw"
                    className="rounded-lg" // Ensure consistency if images are not square
                    data-ai-hint="board member photo"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                    <UserCircle className="h-32 w-32 text-primary opacity-60" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <h2 className="text-2xl font-headline text-primary">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </CardContent>
          </Card>
           <Button asChild variant="outline" className="w-full">
            <Link href="/vorstand">Zurück zur Vorstandsübersicht</Link>
          </Button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Amt & Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Funktion im Verein</h3>
                <p>{member.role}</p>
              </div>
              {member.term && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" /> Amtszeit
                  </h3>
                  <p>{member.term}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> E-Mail
                </h3>
                <a href={`mailto:${member.email.replace('[at]', '@')}`} className="text-primary hover:underline">
                  {member.email.replace('[at]', '@')}
                </a>
              </div>
            </CardContent>
          </Card>

          {member.description && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-3">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-headline">Weitere Informationen</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none text-foreground">
                <p>{member.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
