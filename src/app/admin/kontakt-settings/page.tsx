
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft, Contact } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import type { KontaktPageContent } from '@/types';

const defaultContent: KontaktPageContent = {
    pageTitle: "Kontakt aufnehmen",
    pageSubtitle: "Wir freuen uns auf Ihre Nachricht!",
    formTitle: "Schreiben Sie uns eine Nachricht",
    alternativeContactTitle: "Alternative Kontaktmöglichkeiten",
    addressStreet: "Musterstraße 1",
    addressCity: "48231 Warendorf",
    examplePhoneNumber: "+49 123 4567890 (Vorstand, falls angegeben)",
    dataPrivacyNoteHtml: "Bitte beachten Sie unsere <a href=\"/datenschutz\" class=\"text-primary hover:underline\">Datenschutzerklärung</a> bei der Übermittlung Ihrer Daten."
};

export default function AdminKontaktSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<KontaktPageContent>(defaultContent);
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
        const res = await fetch('/api/admin/site-content/kontakt');
        if (!res.ok) throw new Error('Inhalte der Kontakt-Seite konnten nicht geladen werden.');
        const data: KontaktPageContent = await res.json();
        setContent(prev => ({ ...prev, ...data }));
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

  const handleSave = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    const formData = new FormData();
    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === 'string') {
        formData.append(key, value);
      }
    });

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/site-content/kontakt', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }, 
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');
      
      toast({ title: 'Gespeichert!', description: 'Die Inhalte der Kontakt-Seite wurden aktualisiert.' });
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
        <PageHeader title="Kontakt Seite Verwalten" subtitle="Texte und Informationen der Kontakt-Seite bearbeiten." className="mb-0 pb-0 border-none flex-1"/>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Contact className="mr-2"/>Kontakt-Seiten Texte</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <FormFieldLayout label="Seitentitel" name="pageTitle" value={content.pageTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Seiten-Untertitel" name="pageSubtitle" value={content.pageSubtitle || ''} onChange={handleInputChange} type="textarea" rows={2}/>
            <FormFieldLayout label="Titel des Kontaktformulars" name="formTitle" value={content.formTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Titel 'Alternative Kontaktmöglichkeiten'" name="alternativeContactTitle" value={content.alternativeContactTitle || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Straße und Hausnummer (Postanschrift)" name="addressStreet" value={content.addressStreet || ''} onChange={handleInputChange} />
            <FormFieldLayout label="PLZ und Stadt (Postanschrift)" name="addressCity" value={content.addressCity || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Beispiel Telefonnummer" name="examplePhoneNumber" value={content.examplePhoneNumber || ''} onChange={handleInputChange} />
            <FormFieldLayout label="Datenschutzhinweis (HTML erlaubt)" name="dataPrivacyNoteHtml" value={content.dataPrivacyNoteHtml || ''} onChange={handleInputChange} type="textarea" rows={3}/>
        </CardContent>
      </Card>
       
      <div className="text-center mt-8 mb-8">
        <Button onClick={handleSave} disabled={isSaving || isLoadingData} size="lg">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Kontakt-Seite Speichern
        </Button>
      </div>
    </div>
  );
}

// Helper component for form fields
interface FormFieldLayoutProps {
    label: string;
    name: keyof KontaktPageContent;
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

    