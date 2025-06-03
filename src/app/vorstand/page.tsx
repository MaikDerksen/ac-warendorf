import { PageHeader } from '@/components/page-header';
import { mockBoardMembers } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, UserCircle, CalendarClock } from 'lucide-react';

export default function VorstandPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Der Vorstand des AC Warendorf e. V." />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Unsere Vorstandsmitglieder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Funktion</TableHead>
                  <TableHead>Amtszeit</TableHead>
                  <TableHead>E-Mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBoardMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium flex items-center">
                      <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                      {member.name}
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="flex items-center">
                      {member.term && <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />}
                      {member.term || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${member.email.replace('[at]', '@')}`}
                        className="text-primary hover:underline flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {member.email.replace('[at]', '@')}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <section className="mt-12 p-6 bg-secondary rounded-lg shadow">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-3">Mitwirken und Kontakt</h2>
        <p className="text-foreground mb-4">
          Unser Vorstandsteam engagiert sich ehrenamtlich für die Belange des Vereins und die Förderung des Motorsports in Warendorf. 
          Bei Fragen zu Mitgliedschaft, Veranstaltungen oder anderen Themen rund um den AC Warendorf stehen Ihnen unsere Vorstandsmitglieder gerne zur Verfügung.
        </p>
        <p className="text-foreground">
          Die Kontaktaufnahme ist am einfachsten per E-Mail über die oben genannten Adressen oder über unser allgemeines <a href="/kontakt" className="text-primary hover:underline">Kontaktformular</a>.
        </p>
      </section>
    </div>
  );
}
