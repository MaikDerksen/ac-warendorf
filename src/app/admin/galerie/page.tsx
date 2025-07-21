
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Image as ImageIcon, Loader2, Edit, Trash2, Newspaper } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UnifiedAlbum } from '@/types';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export default function AdminGaleriePage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Form state for creating/editing an album
  const [albumName, setAlbumName] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for managing existing albums
  const [albums, setAlbums] = useState<UnifiedAlbum[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);

  const fetchAlbums = async () => {
    if (!user || !isAdmin) {
      setIsLoadingAlbums(false);
      return;
    }
    setIsLoadingAlbums(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/gallery', {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Alben konnten nicht geladen werden.');
      const data = await response.json();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
      setAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchAlbums();
    } else if (!authLoading) {
      setIsLoadingAlbums(false);
    }
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (album: UnifiedAlbum) => {
    if (album.type === 'manual') {
      setEditingAlbumId(album.id);
      setAlbumName(album.title);
      setAlbumDate(album.date);
      setImageFiles(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        toast({ title: "Hinweis", description: "Galerien aus News-Artikeln werden direkt im jeweiligen Artikel bearbeitet." });
    }
  };

  const handleCancelEdit = () => {
    setEditingAlbumId(null);
    setAlbumName('');
    setAlbumDate('');
    setImageFiles(null);
    const fileInput = document.getElementById('imageFiles') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!user || !isAdmin) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/admin/gallery?id=${albumId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Löschen des Albums.');
      }
      toast({ title: "Erfolg", description: "Album wurde gelöscht." });
      fetchAlbums();
    } catch (error: any) {
      toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  const handleFormSubmit = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    if (!albumName || !albumDate) {
      toast({ title: 'Fehlende Angaben', description: 'Name und Datum des Albums sind erforderlich.', variant: 'destructive' });
      return;
    }
    if (!editingAlbumId && (!imageFiles || imageFiles.length === 0)) {
       toast({ title: 'Keine Bilder ausgewählt', description: 'Bitte wählen Sie mindestens ein Bild für ein neues Album aus.', variant: 'destructive' });
       return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('name', albumName);
    formData.append('date', albumDate);

    if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }
    }
    
    const isUpdating = !!editingAlbumId;
    const url = isUpdating ? `/api/admin/gallery?id=${editingAlbumId}` : '/api/admin/gallery';
    const method = isUpdating ? 'PUT' : 'POST';
    
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${idToken}` },
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Fehler beim Speichern des Albums.');
        }

        toast({
            title: `Album ${isUpdating ? 'aktualisiert' : 'erstellt'}!`,
            description: `Das Album "${albumName}" wurde erfolgreich ${isUpdating ? 'aktualisiert' : 'erstellt'}.`,
        });

        handleCancelEdit();
        fetchAlbums(); // Refresh the list
        
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
          <CardTitle className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5 text-primary"/>
            {editingAlbumId ? 'Album Bearbeiten' : 'Neues Album Erstellen'}
          </CardTitle>
          <CardDescription>
            {editingAlbumId ? `Bearbeiten Sie das Album "${albumName}".` : 'Erstellen Sie hier ein neues Fotoalbum. Alben aus News-Artikeln werden automatisch angezeigt.'}
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
                <label htmlFor="imageFiles" className="text-sm font-medium">Bilder {editingAlbumId ? 'hinzufügen' : 'für das Album'}</label>
                <Input 
                    id="imageFiles"
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="mt-1"
                    disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editingAlbumId ? 'Wählen Sie Bilder aus, um sie diesem Album hinzuzufügen.' : 'Sie können mehrere Bilder auf einmal auswählen.'}
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={handleFormSubmit} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Wird hochgeladen...' : (editingAlbumId ? 'Album Aktualisieren' : 'Album Erstellen')}
                </Button>
                {editingAlbumId && (
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isUploading}>Abbrechen</Button>
                )}
            </div>
        </CardContent>
      </Card>

      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Bestehende Alben verwalten</CardTitle>
           <CardDescription>
            Hier finden Sie manuell erstellte Alben und Galerien aus News-Artikeln.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingAlbums ? (
                <div className="flex items-center justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Alben...</span></div>
            ) : albums.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">Keine Alben gefunden.</p>
            ) : (
                <div className="space-y-4">
                  {albums.map(album => (
                     <div key={album.id} className="flex items-center justify-between p-3 border rounded-lg gap-4">
                        <div className="flex items-center gap-4 overflow-hidden">
                           <Image src={album.coverImageUrl || "https://placehold.co/100x75.png"} alt={album.title} width={80} height={60} className="rounded-md object-cover" />
                           <div className="overflow-hidden">
                               <p className="font-semibold truncate">{album.title}</p>
                               <p className="text-sm text-muted-foreground">{new Date(album.date).toLocaleDateString('de-DE')}</p>
                               <Badge variant={album.type === 'manual' ? 'secondary' : 'outline'} className="mt-1">
                                  {album.type === 'manual' ? <ImageIcon className="mr-1 h-3 w-3"/> : <Newspaper className="mr-1 h-3 w-3" />} 
                                  {album.type === 'manual' ? 'Manuelles Album' : 'News-Galerie'}
                               </Badge>
                           </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {album.type === 'manual' ? (
                            <>
                              <Button variant="outline" size="icon" onClick={() => handleEditClick(album)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Album wirklich löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Das Album "{album.title}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAlbum(album.id)}>Löschen</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <Button variant="outline" asChild>
                              <Link href={`/admin/news#${album.slug}`} title="Zum News-Artikel">
                                <Newspaper className="h-4 w-4 mr-2"/> Artikel bearbeiten
                              </Link>
                            </Button>
                          )}
                        </div>
                     </div>
                  ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
