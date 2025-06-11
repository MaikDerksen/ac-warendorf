
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminPilotenPage() {
  const { toast } = useToast();

  const handleUploadClick = () => {
    toast({
      title: "Funktion in Entwicklung",
      description: "Die Möglichkeit, CSV-Dateien hochzuladen, wird in Kürze implementiert.",
      variant: "default",
    });
  };

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
          <CardTitle>Aktuelle Pilotendaten (pilots.csv)</CardTitle>
          <CardDescription>
            Hier können Sie die aktuellen Pilotendaten herunterladen oder eine neue Version hochladen (Upload-Funktion in Entwicklung).
            Die Daten werden aus der Datei <code>src/data/pilots/pilots.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/piloten" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              pilots.csv herunterladen
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Laden Sie die aktuelle CSV-Datei herunter, um sie extern zu bearbeiten.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Pilotendaten Hochladen</CardTitle>
          <CardDescription>
            Laden Sie eine neue <code>pilots.csv</code> Datei hoch, um die Fahrerprofile zu aktualisieren.
            <strong>Hinweis:</strong> Diese Funktion ist noch in Entwicklung. Das Hochladen einer Datei hier hat aktuell keine Auswirkungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input type="file" accept=".csv" className="flex-grow" />
            <Button onClick={handleUploadClick} className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              CSV Hochladen
            </Button>
          </div>
           <p className="text-xs text-muted-foreground">
            Stellen Sie sicher, dass die hochgeladene CSV-Datei die korrekten Spaltenüberschriften und Datenformate enthält.
          </p>
        </CardContent>
      </Card>
       <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/admin">Zurück zum Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
