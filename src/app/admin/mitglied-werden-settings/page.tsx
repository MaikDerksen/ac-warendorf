
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
import { Loader2, Save, Image as ImageIconLucide, ArrowLeft, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import type { MitgliedWerdenPageContent, FaqItem } from '@/types';
// FormMessage is no longer needed for the JSON validation part
// import { FormMessage } from '@/components/ui/form'; 

const defaultFaqItem: FaqItem = { id: '', question: '', answer: '', displayOrder: 0, icon: 'HelpCircle' };

const defaultContent: MitgliedWerdenPageContent = {
    imageUrl: '',
    pageTitle: "Mitglied werden im Kart-Slalom Team",
    pageSubtitle: "Alle wichtigen Informationen für den Einstieg",
    faqSectionTitle: "Häufig gestellte Fragen (FAQ)",
    faqItems: [ { ...defaultFaqItem, id: 'faq1', question: 'Beispielfrage?', answer: 'Beispielantwort.'} ],
    whatIsKartSlalomTitle: "Was ist Kartslalom?",
    whatIsKartSlalomText: "...",
    wikipediaLinkText: "Wikipedia - Kartslalom",
    wikipediaLinkUrl: "https://de.wikipedia.org/wiki/Kartslalom",
    sidebarTitle: "Interesse geweckt?",
    sidebarText: "Kart-Slalom ist ein faszinierender und sicherer Einstieg...",
    sidebarButtonText: "Jetzt Kontakt aufnehmen!",
    sidebarButtonLink: "/kontakt"
};

export default function AdminMitgliedWerdenSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<MitgliedWerdenPageContent>(defaultContent);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [faqJson, setFaqJson] = useState<string>(JSON.stringify(defaultContent.faqItems, null, 2));

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
        const res = await fetch('/api/admin/site-content/mitglied-werden');
        if (!res.ok) throw new Error('Inhalte konnten nicht geladen werden.');
        const data: MitgliedWerdenPageContent = await res.json();
        setContent(prev => ({ ...prev, ...data, faqItems: data.faqItems || prev.faqItems }));
        if (data.faqItems) {
          setFaqJson(JSON.stringify(data.faqItems, null, 2));
        }
        if (data.imageUrl) {
          setImagePreview(null); 
        }
      } catch (error: any) {
        toast({ title: 'Fehler beim Laden', description: error.message, variant: 'destructive' });
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

  const handleFaqJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFaqJson(e.target.value);
    try {
      const parsedFaqs = JSON.parse(e.target.value);
      if (Array.isArray(parsedFaqs)) {
        setContent(prev => ({ ...prev, faqItems: parsedFaqs }));
      }
    } catch (error) {
      // Invalid JSON, don't update content.faqItems yet
      // Feedback is provided via the conditional paragraph below
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    let parsedFaqsForUpload = content.faqItems;
    try {
        parsedFaqsForUpload = JSON.parse(faqJson);
        if (!Array.isArray(parsedFaqsForUpload)) throw new Error("FAQ JSON is not an array.");
    } catch(e: any) {
        toast({title: "FAQ JSON ungültig", description: "Bitte prüfen Sie das JSON-Format der FAQs. Änderungen an FAQs nicht gespeichert.", variant: "destructive"});
        parsedFaqsForUpload = Array.isArray(content.faqItems) ? content.faqItems : [];
    }

    const formData = new FormData();
    Object.entries(content).forEach(([key, value]) => {
        if (key === 'faqItems') {
            formData.append(key, JSON.stringify(parsedFaqsForUpload));
        } else if (typeof value === 'string') {
            formData.append(key, value);
        }
    });

    if (imageFile) formData.append('imageFile', imageFile);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/site-content/mitglied-werden', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, 
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');
      
      toast({ title: 'Gespeichert!', description: 'Die Inhalte wurden aktualisiert.' });
      
      if (result.updatedFields?.imageUrl) {
        setContent(prev => ({ ...prev, imageUrl: result.updatedFields.imageUrl }));
      }
      setImageFile(null); 
      setImagePreview(null);
      const imageInput = document.getElementById('imageFile-mitglied') as HTMLInputElement | null;
      if (imageInput) imageInput.value = '';

    } catch (error: any) {
      toast({ title: 'Fehler beim Speichern', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoadingData) return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user || !isAdmin) return <p className="text-muted-foreground p-6">Bitte als Admin anmelden.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="Seite 'Mitglied Werden' Verwalten" subtitle="Texte, Bild und FAQs bearbeiten." className="mb-0 pb-0 border-none flex-1"/>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Seiten-Texte</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <FormFieldLayout label="Seitentitel" name="pageTitle" value={content.pageTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Seiten-Untertitel" name="pageSubtitle" value={content.pageSubtitle || ''} onChange={handleInputChange} type="textarea" rows={2}/>
            <FormFieldLayout label="Titel FAQ Sektion" name="faqSectionTitle" value={content.faqSectionTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Titel 'Was ist Kartslalom?' Sektion" name="whatIsKartSlalomTitle" value={content.whatIsKartSlalomTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="'Was ist Kartslalom?' Text (HTML erlaubt)" name="whatIsKartSlalomText" value={content.whatIsKartSlalomText || ''} onChange={handleInputChange} type="textarea" rows={5}/>
            <FormFieldLayout label="Wikipedia Link Text" name="wikipediaLinkText" value={content.wikipediaLinkText || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Wikipedia Link URL" name="wikipediaLinkUrl" value={content.wikipediaLinkUrl || ''} onChange={handleInputChange} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center"><ImageIconLucide className="mr-2"/>Seitenleisten-Inhalt</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <FormFieldLayout label="Titel der Seitenleiste" name="sidebarTitle" value={content.sidebarTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Text der Seitenleiste (HTML erlaubt)" name="sidebarText" value={content.sidebarText || ''} onChange={handleInputChange} type="textarea" rows={3}/>
            <FormFieldLayout label="Button Text Seitenleiste" name="sidebarButtonText" value={content.sidebarButtonText || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Button Link Seitenleiste" name="sidebarButtonLink" value={content.sidebarButtonLink || ''} onChange={handleInputChange} />
            <div>
                <Label htmlFor="imageFile-mitglied">Bild der Seitenleiste</Label>
                {content.imageUrl && !imagePreview && (
                    <Image src={content.imageUrl} alt="Aktuelles Bild" width={200} height={125} className="border rounded-md object-cover my-2" data-ai-hint="karting team"/>
                )}
                {imagePreview && (
                    <Image src={imagePreview} alt="Vorschau Bild" width={200} height={125} className="border rounded-md object-cover my-2" data-ai-hint="preview"/>
                )}
                <Input id="imageFile-mitglied" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><HelpCircle className="mr-2"/>FAQ Einträge (JSON Format)</CardTitle>
          <CardDescription>
            Bearbeiten Sie die FAQs im JSON-Format. Jedes Objekt sollte 'id', 'question', 'answer', optional 'icon', 'category', 'displayOrder' enthalten.
            Die 'id' muss für jedes FAQ-Item eindeutig sein.
            'displayOrder' ist eine Zahl für die Sortierung (kleinere Zahlen zuerst).
            'icon' ist optional und kann ein Lucide Icon Name sein (z.B. HelpCircle, Users).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={faqJson}
            onChange={handleFaqJsonChange}
            rows={15}
            placeholder='[{"id": "faq1", "question": "Frage?", "answer": "<p>Antwort HTML erlaubt.</p>", "displayOrder": 1, "icon": "HelpCircle"}]'
          />
          {/* Replaced FormMessage with a styled paragraph for validation */}
          {!isValidJson(faqJson) && faqJson.trim().length > 0 && (
            <p className="text-sm font-medium text-destructive mt-2">Ungültiges JSON-Format!</p>
          )}
        </CardContent>
      </Card>
       
      <div className="text-center mt-8 mb-8">
        <Button onClick={handleSave} disabled={isSaving || isLoadingData} size="lg">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          'Mitglied Werden' Seite Speichern
        </Button>
      </div>
    </div>
  );
}

function isValidJson(str: string) {
  if (!str.trim()) return true; // Allow empty or whitespace-only string as valid (no error shown)
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

interface FormFieldLayoutProps {
    label: string;
    name: keyof MitgliedWerdenPageContent; // This is fine, as these are for the 'content' state object
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
            <Textarea id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows} />
        ) : (
            <Input id={name} name={name} type={type} value={value || ''} onChange={onChange} placeholder={placeholder} />
        )}
    </div>
);
    
