
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPilotenPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück zum Admin Dashboard</span>
          </Link>
        </Button>
        <PageHeader title="Piloten Verwalten" subtitle="Fahrerprofile und Erfolge aktualisieren." className="mb-0 pb-0 border-none flex-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Funktionalität in Entwicklung</CardTitle>
          <CardDescription>
            Diese Seite dient zur Verwaltung der Pilotenprofile. Die Bearbeitungsfunktionen werden in einem zukünftigen Schritt implementiert.
            Aktuell werden die Pilotendaten aus der Datei <code>src/data/pilots/pilots.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Um Inhalte zu ändern, bearbeiten Sie bitte die entsprechende CSV-Datei direkt im Projektverzeichnis.
            Eine web-basierte Bearbeitung über dieses Admin-Panel ist das Ziel für zukünftige Entwicklungen.
          </p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin">Zurück zum Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
