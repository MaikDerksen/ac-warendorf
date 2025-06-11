
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminGaleriePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück zum Admin Dashboard</span>
          </Link>
        </Button>
        <PageHeader title="Bildergalerie Verwalten" subtitle="Bilder hochladen und organisieren." className="mb-0 pb-0 border-none flex-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Funktionalität in Entwicklung</CardTitle>
          <CardDescription>
            Diese Seite dient zur Verwaltung der Bildergalerie. Die Bearbeitungsfunktionen werden in einem zukünftigen Schritt implementiert.
            Aktuell gibt es noch keine dedizierte Datenquelle oder Struktur für eine Bildergalerie, die über dieses Panel verwaltet werden könnte.
            Bilder werden derzeit direkt in den Seiten oder über CSV-Dateien (z.B. für News-Header) referenziert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Die Implementierung einer Bildergalerie-Verwaltung würde eine klare Struktur für die Bilddaten (z.B. eine CSV-Datei oder Datenbanktabelle mit Bild-URLs, Titeln, Beschreibungen)
            und entsprechende Anzeigekomponenten auf der Webseite erfordern. Ein Backend wäre nötig, um Uploads und die Organisation der Bilder zu handhaben.
          </p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin">Zurück zum Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
