
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, ArrowLeft, DatabaseZap } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function AdminMigrationPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setJsonFile(file);
    } else {
      setJsonFile(null);
      if (file) {
          toast({ title: 'Ungültiger Dateityp', description: 'Bitte wählen Sie eine gültige .json Datei aus.', variant: 'destructive' });
      }
    }
  };

  const handleMigrate = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    if (!jsonFile) {
      toast({ title: 'Keine Datei ausgewählt', description: 'Bitte wählen Sie die wp-posts.json Datei zum Importieren aus.', variant: 'destructive' });
      return;
    }
    
    setIsMigrating(true);
    
    const formData = new FormData();
    formData.append('wpPostsJson', jsonFile);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/migration', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, 
        body: formData,
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Ein unbekannter Fehler ist beim Migrieren aufgetreten.');
      }
      
      toast({ 
        title: 'Migration Erfolgreich!', 
        description: `Es wurden ${result.importedCount} von ${result.totalCount} Artikeln erfolgreich importiert.` 
      });
      
      const fileInput = document.getElementById('jsonFile-migration') as HTMLInputElement | null;
      if(fileInput) fileInput.value = '';
      setJsonFile(null);

    } catch (error: any) {
      toast({ title: 'Fehler bei der Migration', description: error.message, variant: 'destructive' });
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="WordPress Migration" subtitle="News-Artikel aus einer WordPress JSON-Datei importieren." className="mb-0 pb-0 border-none flex-1"/>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center"><DatabaseZap className="mr-2"/>Daten-Import</CardTitle>
            <CardDescription>
                Laden Sie hier Ihre <code>wp-posts.json</code> Datei hoch, um alle veröffentlichten Beiträge von Ihrer alten WordPress-Seite als News-Artikel zu importieren. Bestehende Artikel mit identischem Slug werden übersprungen.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Input id="jsonFile-migration" type="file" accept="application/json" onChange={handleFileChange} />
                {jsonFile && <p className="text-sm text-muted-foreground">Ausgewählte Datei: {jsonFile.name}</p>}
            </div>
            
            <Button onClick={handleMigrate} disabled={isMigrating || !jsonFile || !isAdmin}>
              {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Import Starten
            </Button>
            
            {!isAdmin && user && (
                <p className="text-destructive font-medium">Sie müssen als Admin angemeldet sein, um die Migration durchzuführen.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
