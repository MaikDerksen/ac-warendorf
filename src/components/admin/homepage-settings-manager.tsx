
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BoardMember, SiteSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2, Users, Save, Image as ImageIcon } from 'lucide-react';

const MAX_CONTACT_PERSONS = 4;
const NONE_OPTION_VALUE = "--none--"; // Unique value for the "none" option

export function HomepageSettingsManager() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  // Initialize with enough empty strings for MAX_CONTACT_PERSONS
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(() => Array(MAX_CONTACT_PERSONS).fill(''));
  
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
        // Fetch board members and current site settings concurrently
        const [membersRes, settingsRes] = await Promise.all([
          fetch('/api/admin/vorstand'), 
          fetch('/api/admin/settings/homepage-contacts')
        ]);

        if (!membersRes.ok) throw new Error('Vorstandsmitglieder konnten nicht geladen werden.');
        const membersData = await membersRes.json();
        setBoardMembers(membersData);

        if (!settingsRes.ok) throw new Error('Aktuelle Seiteneinstellungen konnten nicht geladen werden.');
        // Ensure type matches expected API response structure
        const settingsData: SiteSettings & {logoUrl?: string, homepageHeroImageUrl?: string} = await settingsRes.json();
        
        const currentIds = settingsData.contactPersonIds || [];
        const initialSelection = Array(MAX_CONTACT_PERSONS).fill('');
        currentIds.slice(0, MAX_CONTACT_PERSONS).forEach((id: string, index: number) => {
          initialSelection[index] = id;
        });
        setSelectedContactIds(initialSelection);

        // Set current image URLs from fetched settings
        setCurrentLogoUrl(settingsData.logoUrl);
        setLogoPreview(null); // Clear preview on fetch
        setCurrentHeroImageUrl(settingsData.homepageHeroImageUrl);
        setHeroImagePreview(null); // Clear preview on fetch

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
    // Trigger fetch only when auth state is resolved and user is admin
    if (!authLoading && user && isAdmin) {
      fetchData();
    } else if (!authLoading && (!user || !isAdmin)) {
        // If user is not admin or not logged in, stop loading
        setIsLoadingData(false);
    }
  }, [user, isAdmin, authLoading, toast]);

  const handleSelectChange = (index: number, value: string) => {
    const newSelection = [...selectedContactIds];
    // Use the special NONE_OPTION_VALUE to represent clearing the selection
    const idToStore = value === NONE_OPTION_VALUE ? "" : value;

    // Prevent selecting the same person in multiple dropdowns
    if (idToStore && newSelection.some((id, i) => id === idToStore && i !== index)) {
        toast({
            title: "Doppelte Auswahl",
            description: "Diese Person wurde bereits ausgewählt. Bitte wählen Sie eine andere.",
            variant: "default" // Using "default" or "warning" if available
        });
        return; // Do not update state if selection is a duplicate
    }
    newSelection[index] = idToStore;
    setSelectedContactIds(newSelection);
  };

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
      // Clear file and preview if no file is selected (e.g., user cancels file dialog)
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
    
    // Filter out empty strings before saving, only send actual IDs
    const finalContactIds = selectedContactIds.filter(id => id && id !== NONE_OPTION_VALUE); 
    // Double check for duplicates before sending to API, though UI should prevent this
    if (new Set(finalContactIds).size !== finalContactIds.length) {
        toast({ title: "Fehler: Doppelte Auswahl bei Kontakten", description: "Bitte korrigieren Sie die Auswahl.", variant: "destructive" });
        setIsSaving(false);
        return;
    }
    
    const formData = new FormData();
    formData.append('contactPersonIds', JSON.stringify(finalContactIds)); // Send filtered, valid IDs
    if (logoFile) formData.append('logoFile', logoFile);
    if (heroImageFile) formData.append('homepageHeroImageFile', heroImageFile);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/settings/homepage-contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, // No Content-Type needed for FormData
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern der Einstellungen.');
      
      toast({
        title: 'Gespeichert!',
        description: 'Die Homepage-Einstellungen wurden erfolgreich aktualisiert.',
      });
      
      // Update current URLs if they were returned by the API
      if (result.updatedFields?.logoUrl) setCurrentLogoUrl(result.updatedFields.logoUrl);
      if (result.updatedFields?.homepageHeroImageUrl) setCurrentHeroImageUrl(result.updatedFields.homepageHeroImageUrl);
      
      // Reset file inputs and previews after successful save
      setLogoFile(null); setLogoPreview(null);
      setHeroImageFile(null); setHeroImagePreview(null);
      
      // Clear file input fields visually
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Homepage Einstellungen</CardTitle>
          <CardDescription>Logo, Hero-Bild und Ansprechpartner für die Startseite.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Lade Daten...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Homepage Einstellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bitte als Admin anmelden, um diese Einstellungen zu verwalten.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Homepage Einstellungen Verwalten</CardTitle>
        <CardDescription>Logo, Hero-Hintergrundbild und bis zu {MAX_CONTACT_PERSONS} Ansprechpartner für die Startseite festlegen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Logo Upload */}
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

        {/* Hero Image Upload */}
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
        
        <hr className="my-6"/>

        {/* Contact Persons Selection */}
        <div className="space-y-2">
            <Label className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground"/>Homepage Ansprechpartner</Label>
            <CardDescription>Wählen Sie bis zu {MAX_CONTACT_PERSONS} Ansprechpartner aus.</CardDescription>
        </div>
        {selectedContactIds.map((selectedId, index) => (
          <div key={`contact-slot-${index}`} className="space-y-2">
            <Label htmlFor={`contact-person-${index}`}>Ansprechpartner {index + 1}</Label>
            <Select
              value={selectedId || NONE_OPTION_VALUE} // Ensure Select value is set
              onValueChange={(value) => handleSelectChange(index, value)}
            >
              <SelectTrigger id={`contact-person-${index}`}>
                <SelectValue placeholder="-- Bitte wählen --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_OPTION_VALUE}>-- Keiner --</SelectItem>
                {boardMembers.map((member) => (
                  <SelectItem 
                    key={member.id} // Unique key for each member
                    value={member.id} 
                    disabled={selectedContactIds.some((id, i) => id === member.id && i !== index && id !== "")}
                  >
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button onClick={handleSave} disabled={isSaving || isLoadingData} className="mt-6">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Alle Homepage-Einstellungen Speichern
        </Button>
      </CardContent>
    </Card>
  );
}

    