
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function AdminGaleriePage() {
  const { toast } = useToast();
  const [albumName, setAlbumName] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const handleUploadClick = () => {
    // In a real implementation, this would trigger an API call
    console.log({
        albumName,
        albumDate,
        imageFiles
    });
    toast({
      title: "Funktion in Entwicklung",
      description: `Das Erstellen von Alben wird in Kürze implementiert.`,
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
        <PageHeader title="Bildergalerie Verwalten" subtitle="Eigenständige Bildergalerien erstellen und organisieren." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Neues Album Erstellen</CardTitle>
          <CardDescription>
            Erstellen Sie hier ein neues, eigenständiges Fotoalbum, das in der Galerie angezeigt wird. Alben aus News-Artikeln werden automatisch hinzugefügt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="albumName" className="text-sm font-medium">Name des Albums</label>
                    <Input 
                        id="albumName"
                        type="text" 
                        placeholder="z.B. Sommertraining 2024"
                        value={albumName}
                        onChange={(e) => setAlbumName(e.target.value)}
                        className="mt-1"
                    />
                 </div>
                 <div>
                    <label htmlFor="albumDate" className="text-sm font-medium">Datum des Albums</label>
                    <Input 
                        id="albumDate"
                        type="date"
                        value={albumDate}
                        onChange={(e) => setAlbumDate(e.target.value)}
                        className="mt-1"
                    />
                 </div>
            </div>
            <div>
                <label htmlFor="imageFiles" className="text-sm font-medium">Bilder für das Album</label>
                <Input 
                    id="imageFiles"
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Sie können mehrere Bilder auf einmal auswählen.</p>
            </div>
            <Button onClick={handleUploadClick} disabled={!albumName || !albumDate || !imageFiles}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Album erstellen & Bilder hochladen
            </Button>
        </CardContent>
      </Card>

      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Bestehende Alben verwalten</CardTitle>
           <CardDescription>
            Eine Liste aller existierenden Alben (sowohl aus News als auch manuell erstellte) wird hier zur Bearbeitung und zum Löschen angezeigt. Diese Ansicht ist derzeit in Entwicklung.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-6">
                Die Verwaltungsansicht für bestehende Alben wird in Kürze implementiert.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}
