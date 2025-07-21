
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminGaleriePage() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [albumName, setAlbumName] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    if (!albumName || !albumDate || !imageFiles || imageFiles.length === 0) {
      toast({ title: 'Fehlende Angaben', description: 'Bitte füllen Sie alle Felder aus und wählen Sie Bilder aus.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('name', albumName);
    formData.append('date', albumDate);
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Fehler beim Erstellen des Albums.');
        }

        toast({
            title: "Album erstellt!",
            description: `Das Album "${albumName}" wurde erfolgreich mit ${imageFiles.length} Bildern erstellt.`,
        });

        // Reset form
        setAlbumName('');
        setAlbumDate('');
        setImageFiles(null);
        const fileInput = document.getElementById('imageFiles') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';

        // Here you would typically refetch the list of albums to display them
        
    } catch (error: any) {
        toast({
            title: "Fehler",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsUploading(false);
    }
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
                        disabled={isUploading}
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
                        disabled={isUploading}
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
                    disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">Sie können mehrere Bilder auf einmal auswählen.</p>
            </div>
            <Button onClick={handleUploadClick} disabled={!albumName || !albumDate || !imageFiles || isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isUploading ? 'Wird hochgeladen...' : 'Album erstellen & Bilder hochladen'}
            </Button>
        </CardContent>
      </Card>

      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Bestehende Alben verwalten</CardTitle>
           <CardDescription>
            Eine Liste aller existierenden Alben (sowohl aus News als auch manuell erstellte) wird hier zur Bearbeitung und zum Löschen angezeigt.
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
