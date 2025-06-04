
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function OldieCupPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Oldie-Cup" subtitle="Informationen zum Oldie-Cup des AC Warendorf" />
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <p className="text-lg text-foreground">
            Weitere Informationen zum Oldie-Cup folgen in Kürze. Schauen Sie bald wieder vorbei!
          </p>
           <p className="mt-4 text-foreground">
            Der Oldie-Cup ist eine geplante Veranstaltung für unsere erfahrenen Motorsport-Enthusiasten und Liebhaber klassischer Fahrzeuge.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
