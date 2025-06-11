
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück zum Admin Dashboard</span>
          </Link>
        </Button>
        <PageHeader title="News Verwalten" subtitle="Artikel erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Funktionalität in Entwicklung</CardTitle>
          <CardDescription>
            Diese Seite dient zur Verwaltung der News-Artikel. Die Bearbeitungsfunktionen werden in einem zukünftigen Schritt implementiert.
            Aktuell werden die News-Daten aus der Datei <code>src/data/news/news.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Um Inhalte zu ändern, bearbeiten Sie bitte die entsprechende CSV-Datei direkt im Projektverzeichnis.
            Eine web-basierte Bearbeitung über dieses Admin-Panel ist das Ziel für zukünftige Entwicklungen.
            Dies würde typischerweise ein Backend (z.B. Python-basiert mit einer Datenbank oder CSV-Management) erfordern,
            um die Änderungen sicher und benutzerfreundlich zu handhaben.
          </p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin">Zurück zum Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
