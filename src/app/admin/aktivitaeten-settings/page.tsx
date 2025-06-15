
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2, Save, Image as ImageIconLucide, ArrowLeft, Info, ListChecks, YoutubeIcon } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import type { AktivitaetenPageContent } from '@/types';

const defaultContent: AktivitaetenPageContent = {
    mainImageUrl: '',
    kartSlalomSectionTitle: "Kart-Slalom: Unsere Hauptaktivität",
    kartSlalomIntroParagraph: "Zur Zeit konzentriert sich der AC Warendorf e.V. auf den <strong>Kart-Slalom</strong>...",
    kartSlalomDetailParagraph1: "Im Kart-Slalom geht es darum...",
    kartSlalomDetailParagraph2: "Unsere jungen Talente nehmen regelmäßig...",
    youtubeEmbedId: "RCK5CPkfXbY",
    youtubeSectionTitle: "Kart-Slalom in Aktion",
    youtubeSectionText: "Sehen Sie hier ein Beispielvideo...",
    futurePossibilitiesTitle: "Zukünftige Möglichkeiten",
    futurePossibilitiesIntro: "Wenn ausreichend Interesse besteht...",
    futurePossibilitiesItems: [
      "<strong>SimRacing:</strong> Virtueller Motorsport...",
      "<strong>Youngster Slalom Cup:</strong> Der nächste Schritt...",
      "<strong>Oldtimer-Ausfahrten oder -Treffen:</strong> Für Liebhaber..."
    ]
};

export default function AdminAktivitaetenSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<AktivitaetenPageContent>(defaultContent);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

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
        const res = await fetch('/api/admin/site-content/aktivitaeten');
        if (!res.ok) throw new Error('Inhalte der Aktivitäten-Seite konnten nicht geladen werden.');
        const data: AktivitaetenPageContent = await res.json();
        setContent(prev => ({ ...prev, ...data, futurePossibilitiesItems: data.futurePossibilitiesItems || prev.futurePossibilitiesItems }));
        if (data.mainImageUrl) {
          setMainImagePreview(null); // Clear local preview if remote image exists
        }
      } catch (error: any) {
        toast({
          title: 'Fehler beim Laden der Daten',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    if (!authLoading && user && isAdmin) {
      fetchData();
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [user, isAdmin, authLoading, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleListItemsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(prev => ({ ...prev, futurePossibilitiesItems: e.target.value.split('\n').map(item => item.trim()).filter(item => item) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImageFile(null);
      setMainImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    const formData = new FormData();
    // Append all text fields from content state
    Object.entries(content).forEach(([key, value]) => {
      if (key === 'futurePossibilitiesItems' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    });

    if (mainImageFile) formData.append('mainImageFile', mainImageFile);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/site-content/aktivitaeten', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, 
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');
      
      toast({ title: 'Gespeichert!', description: 'Die Inhalte der Aktivitäten-Seite wurden aktualisiert.' });
      
      if (result.updatedFields?.mainImageUrl) {
        setContent(prev => ({ ...prev, mainImageUrl: result.updatedFields.mainImageUrl }));
      }
      setMainImageFile(null); 
      setMainImagePreview(null);
      const imageInput = document.getElementById('mainImageFile-aktivitaeten') as HTMLInputElement | null;
      if (imageInput) imageInput.value = '';

    } catch (error: any) {
      toast({ title: 'Fehler beim Speichern', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoadingData) {
    return (
      <div className="space-y-6"><div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Lade Daten...</span></div></div>
    );
  }

  if (!user || !isAdmin) {
    return <div className="space-y-6"><p className="text-muted-foreground p-6">Bitte als Admin anmelden.</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Zurück</span></Link></Button>
        <PageHeader title="Aktivitäten Seite Verwalten" subtitle="Texte und Bilder der 'Aktivitäten' Seite bearbeiten." className="mb-0 pb-0 border-none flex-1"/>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><ImageIconLucide className="mr-2 h-5 w-5 text-primary"/>Hauptbild</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="mainImageFile-aktivitaeten">Hauptbild der Seite</Label>
          {content.mainImageUrl && !mainImagePreview && (
            <Image src={content.mainImageUrl} alt="Aktuelles Hauptbild" width={300} height={200} className="border rounded-md object-cover my-2" data-ai-hint="karting event"/>
          )}
          {mainImagePreview && (
            <Image src={mainImagePreview} alt="Vorschau Hauptbild" width={300} height={200} className="border rounded-md object-cover my-2" data-ai-hint="karting preview"/>
          )}
          <Input id="mainImageFile-aktivitaeten" type="file" accept="image/*" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">Empfohlen: Passendes Format zum Layout (z.B. 600x400px).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Kart-Slalom Sektion</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormFieldLayout label="Titel der Sektion" name="kartSlalomSectionTitle" value={content.kartSlalomSectionTitle || ''} onChange={handleInputChange} />
          <FormFieldLayout label="Einleitungstext (HTML erlaubt)" name="kartSlalomIntroParagraph" value={content.kartSlalomIntroParagraph || ''} onChange={handleInputChange} type="textarea" rows={3}/>
          <FormFieldLayout label="Detailtext Absatz 1 (HTML erlaubt)" name="kartSlalomDetailParagraph1" value={content.kartSlalomDetailParagraph1 || ''} onChange={handleInputChange} type="textarea" rows={4}/>
          <FormFieldLayout label="Detailtext Absatz 2 (HTML erlaubt)" name="kartSlalomDetailParagraph2" value={content.kartSlalomDetailParagraph2 || ''} onChange={handleInputChange} type="textarea" rows={4}/>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center"><YoutubeIcon className="mr-2 h-5 w-5 text-primary"/>YouTube Video Sektion</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormFieldLayout label="YouTube Video ID" name="youtubeEmbedId" value={content.youtubeEmbedId || ''} onChange={handleInputChange} placeholder="z.B. RCK5CPkfXbY" />
          <FormFieldLayout label="Titel der YouTube Sektion (HTML erlaubt)" name="youtubeSectionTitle" value={content.youtubeSectionTitle || ''} onChange={handleInputChange} />
          <FormFieldLayout label="Text unter YouTube Titel (HTML erlaubt)" name="youtubeSectionText" value={content.youtubeSectionText || ''} onChange={handleInputChange} type="textarea" rows={2}/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Sektion Zukünftige Möglichkeiten</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormFieldLayout label="Titel der Sektion (HTML erlaubt)" name="futurePossibilitiesTitle" value={content.futurePossibilitiesTitle || ''} onChange={handleInputChange} />
          <FormFieldLayout label="Einleitungstext (HTML erlaubt)" name="futurePossibilitiesIntro" value={content.futurePossibilitiesIntro || ''} onChange={handleInputChange} type="textarea" rows={3}/>
          <div>
            <Label htmlFor="futurePossibilitiesItems">Listenpunkte (HTML erlaubt, ein Punkt pro Zeile)</Label>
            <Textarea
              id="futurePossibilitiesItems"
              name="futurePossibilitiesItems"
              value={content.futurePossibilitiesItems?.join('\n') || ''}
              onChange={handleListItemsChange}
              rows={5}
              placeholder="Punkt 1...\nPunkt 2..."
            />
          </div>
        </CardContent>
      </Card>
       
      <div className="text-center mt-8 mb-8">
        <Button onClick={handleSave} disabled={isSaving || isLoadingData} size="lg">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Aktivitäten-Seite Speichern
        </Button>
      </div>
    </div>
  );
}

// Helper component for form fields
interface FormFieldLayoutProps {
    label: string;
    name: keyof AktivitaetenPageContent;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: 'text' | 'textarea';
    placeholder?: string;
    rows?: number;
}
const FormFieldLayout: React.FC<FormFieldLayoutProps> = ({ label, name, value, onChange, type = "text", placeholder, rows }) => (
    <div className="space-y-1">
        <Label htmlFor={name}>{label}</Label>
        {type === 'textarea' ? (
            <Textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
        ) : (
            <Input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
        )}
    </div>
);

    