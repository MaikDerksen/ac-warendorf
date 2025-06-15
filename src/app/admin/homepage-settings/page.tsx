
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2, Save, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import type { SiteSettings } from '@/types';

export default function HomepageSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [currentHeroImageUrl, setCurrentHeroImageUrl] = useState<string | undefined>(undefined);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const settingsRes = await fetch('/api/admin/settings/homepage-images'); 
        if (!settingsRes.ok) throw new Error('Aktuelle Seiteneinstellungen konnten nicht geladen werden.');
        const settingsData: Partial<SiteSettings> = await settingsRes.json();
        
        setCurrentLogoUrl(settingsData.logoUrl);
        setLogoPreview(null); 
        setCurrentHeroImageUrl(settingsData.homepageHeroImageUrl);
        setHeroImagePreview(null); 

      } catch (error: any) {
        toast({
          title: 'Fehler beim Laden der Daten',
          description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    if (!authLoading && user && isAdmin) {
      fetchData();
    } else if (!authLoading && (!user || !isAdmin)) {
        setIsLoadingData(false);
    }
  }, [user, isAdmin, authLoading, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setHeroImageFile(file);
        setHeroImagePreview(URL.createObjectURL(file));
      }
    } else {
      if (type === 'logo') {
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        setHeroImageFile(null);
        setHeroImagePreview(null);
      }
    }
  };

  const handleSave = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', description: 'Sie müssen Admin sein, um Einstellungen zu speichern.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
        
    const formData = new FormData();
    if (logoFile) formData.append('logoFile', logoFile);
    if (heroImageFile) formData.append('homepageHeroImageFile', heroImageFile);

    if (!logoFile && !heroImageFile) {
      toast({ title: 'Keine Änderungen', description: 'Es wurden keine neuen Bilder zum Speichern ausgewählt.', variant: 'default' });
      setIsSaving(false);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/settings/homepage-images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, 
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern der Einstellungen.');
      
      toast({
        title: 'Gespeichert!',
        description: 'Die Homepage-Bilder wurden erfolgreich aktualisiert.',
      });
      
      if (result.updatedFields?.logoUrl) setCurrentLogoUrl(result.updatedFields.logoUrl);
      if (result.updatedFields?.homepageHeroImageUrl) setCurrentHeroImageUrl(result.updatedFields.homepageHeroImageUrl);
      
      setLogoFile(null); setLogoPreview(null);
      setHeroImageFile(null); setHeroImagePreview(null);
      
      const logoInput = document.getElementById('logoFile-settings') as HTMLInputElement | null;
      if (logoInput) logoInput.value = '';
      const heroInput = document.getElementById('heroImageFile-settings') as HTMLInputElement | null;
      if (heroInput) heroInput.value = '';

    } catch (error: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
               <span className="sr-only">Zurück zum Admin Dashboard</span>
            </Link>
          </Button>
          <PageHeader title="Homepage Bilder Verwalten" subtitle="Logo und Hero-Hintergrundbild der Startseite festlegen." className="mb-0 pb-0 border-none flex-1" />
        </div>
        <Card>
            <CardContent className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Lade Daten...</span>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
               <span className="sr-only">Zurück zum Admin Dashboard</span>
            </Link>
          </Button>
          <PageHeader title="Homepage Bilder Verwalten" subtitle="Logo und Hero-Hintergrundbild der Startseite festlegen." className="mb-0 pb-0 border-none flex-1" />
        </div>
        <Card>
            <CardContent>
            <p className="text-muted-foreground p-6">Bitte als Admin anmelden, um diese Einstellungen zu verwalten.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                 <span className="sr-only">Zurück zum Admin Dashboard</span>
            </Link>
            </Button>
            <PageHeader title="Homepage Bilder Verwalten" subtitle="Logo und Hero-Hintergrundbild der Startseite festlegen." className="mb-0 pb-0 border-none flex-1"/>
        </div>
        <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Logo & Hero-Bild</CardTitle>
            <CardDescription>Verwalten Sie hier das globale Logo und das Hintergrundbild der Startseite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-2">
            <Label htmlFor="logoFile-settings">Vereinslogo (Navbar & Homepage)</Label>
            {currentLogoUrl && !logoPreview && (
                <div className="my-2">
                <p className="text-xs text-muted-foreground mb-1">Aktuelles Logo:</p>
                <Image src={currentLogoUrl} alt="Aktuelles Logo" width={100} height={100} className="border rounded-md object-contain" data-ai-hint="club logo current"/>
                </div>
            )}
            {logoPreview && (
                <div className="my-2">
                <p className="text-xs text-muted-foreground mb-1">Neues Logo (Vorschau):</p>
                <Image src={logoPreview} alt="Logo Vorschau" width={100} height={100} className="border rounded-md object-contain" data-ai-hint="club logo preview"/>
                </div>
            )}
            <Input 
                id="logoFile-settings" 
                type="file" 
                accept="image/png, image/jpeg, image/gif, image/svg+xml" 
                onChange={(e) => handleFileChange(e, 'logo')}
            />
            <p className="text-xs text-muted-foreground">Empfohlen: PNG oder SVG. Wird auf ca. 80x80px angezeigt.</p>
            </div>

            <div className="space-y-2">
            <Label htmlFor="heroImageFile-settings">Homepage Hero-Hintergrundbild</Label>
            {currentHeroImageUrl && !heroImagePreview && (
                <div className="my-2">
                <p className="text-xs text-muted-foreground mb-1">Aktuelles Hero-Bild:</p>
                <Image src={currentHeroImageUrl} alt="Aktuelles Hero-Bild" width={300} height={150} className="border rounded-md object-cover" data-ai-hint="hero background current"/>
                </div>
            )}
            {heroImagePreview && (
                <div className="my-2">
                <p className="text-xs text-muted-foreground mb-1">Neues Hero-Bild (Vorschau):</p>
                <Image src={heroImagePreview} alt="Hero-Bild Vorschau" width={300} height={150} className="border rounded-md object-cover" data-ai-hint="hero background preview"/>
                </div>
            )}
            <Input 
                id="heroImageFile-settings" 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={(e) => handleFileChange(e, 'hero')} 
            />
            <p className="text-xs text-muted-foreground">Empfohlen: JPG oder WEBP, Seitenverhältnis ca. 16:9 (z.B. 1920x1080px).</p>
            </div>
        </CardContent>
        </Card>
       
        <div className="text-center mt-8 mb-8">
             <Button onClick={handleSave} disabled={isSaving || isLoadingData} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Homepage-Bilder Speichern
            </Button>
        </div>
    </div>
  );
}

    