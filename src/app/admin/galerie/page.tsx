
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminGaleriePage() {
  const { toast } = useToast();

  const handleUploadClick = (dataType: string) => {
    toast({
      title: "Funktion in Entwicklung",
      description: `Die Möglichkeit, ${dataType} hochzuladen, wird in Kürze implementiert.`,
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
        <PageHeader title="Bildergalerie Verwalten" subtitle="Bilder hochladen und organisieren." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Bildergalerie Management</CardTitle>
          <CardDescription>
            Die Verwaltung einer Bildergalerie ist komplexer als CSV-Daten. Sie würde typischerweise das Hochladen einzelner Bilddateien und möglicherweise eine Metadaten-Datei (z.B. JSON oder CSV) für Titel, Beschreibungen etc. umfassen.
            Aktuell gibt es keine dedizierte Datenquelle oder Struktur für eine Bildergalerie, die über dieses Panel verwaltet werden könnte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">
                Für eine zukünftige Bildergalerie-Verwaltung könnten folgende Aktionen relevant sein:
            </p>
             <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                <li>Download einer Metadaten-Datei (z.B. <code>gallery_meta.csv</code>), falls vorhanden.</li>
                <li>Upload einer neuen Metadaten-Datei.</li>
                <li>Upload einzelner Bilddateien (z.B. JPG, PNG).</li>
            </ul>
        </CardContent>
      </Card>

      <Separator />
      
      {/* Placeholder for Gallery Metadata CSV */}
      <Card>
        <CardHeader>
          <CardTitle>Galerie Metadaten (gallery_meta.csv - Hypothetisch)</CardTitle>
           <CardDescription>
            Download/Upload einer CSV-Datei, die Metadaten für Galeriebilder enthalten könnte (z.B. Bild-URL, Titel, Beschreibung).
            <strong>Hinweis:</strong> Die Download-API und Upload-Verarbeitung für Galeriedaten sind nicht implementiert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => handleUploadClick("Galerie-Metadaten CSV")}>
            <Download className="mr-2 h-4 w-4" />
            gallery_meta.csv herunterladen (Platzhalter)
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-4">
            <Input type="file" accept=".csv" className="flex-grow" />
            <Button onClick={() => handleUploadClick("Galerie-Metadaten CSV")} className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              Metadaten-CSV Hochladen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Placeholder for Individual Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Einzelne Bilder Hochladen</CardTitle>
          <CardDescription>
            Hochladen von Bilddateien (z.B. JPG, PNG) für die Galerie.
            <strong>Hinweis:</strong> Diese Funktion ist noch in Entwicklung. Das Hochladen einer Datei hier hat aktuell keine Auswirkungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input type="file" accept="image/jpeg,image/png,image/gif" className="flex-grow" />
            <Button onClick={() => handleUploadClick("Bilddateien")} className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              Bild Hochladen
            </Button>
          </div>
           <p className="text-xs text-muted-foreground">
            Unterstützte Formate: JPG, PNG, GIF. Achten Sie auf eine angemessene Dateigröße für Web-Performance.
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
