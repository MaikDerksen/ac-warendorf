
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Building, Edit, Trash2, Loader2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { Sponsor } from '@/types';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const sponsorFormSchema = z.object({
  name: z.string().min(2, "Name muss mind. 2 Zeichen haben."),
  level: z.string().min(3, "Sponsoring-Level muss angegeben werden."),
  logoFile: z.any().optional(),
  websiteUrl: z.string().url({ message: "Bitte eine gültige URL eingeben oder leer lassen." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, "Maximal 50 Zeichen.").optional(),
  displayOrder: z.coerce.number().optional(),
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

export default function AdminSponsorenPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: { name: "", level: "Partner", logoFile: undefined, websiteUrl: "", dataAiHint: "", displayOrder: 99 },
  });

  const fetchSponsors = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sponsoren');
      if (!response.ok) throw new Error('Sponsoren konnten nicht geladen werden.');
      const data = await response.json();
      setSponsors(data);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAdmin) fetchSponsors();
    else if (!authLoading) setIsLoading(false);
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    form.reset({
      name: sponsor.name,
      level: sponsor.level,
      websiteUrl: sponsor.websiteUrl || "",
      dataAiHint: sponsor.dataAiHint || "",
      displayOrder: sponsor.displayOrder || 99,
      logoFile: undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingSponsor(null);
    form.reset({ name: "", level: "Partner", logoFile: undefined, websiteUrl: "", dataAiHint: "", displayOrder: 99 });
  };

  const handleDelete = async (sponsorId: string, sponsorName: string) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/sponsoren?id=${sponsorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Sponsors.');
        }
        toast({ title: "Erfolg", description: `Sponsor ${sponsorName} wurde gelöscht.` });
        fetchSponsors();
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  async function onSubmit(data: SponsorFormValues) {
    if (!user || !isAdmin) return;
    
    const idToken = await user.getIdToken();
    const formData = new FormData();
    const sponsorId = editingSponsor ? editingSponsor.id : data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    formData.append('id', sponsorId);

    (Object.keys(data) as Array<keyof SponsorFormValues>).forEach(key => {
      const value = data[key];
      if (key === 'logoFile' && value?.[0]) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && key !== 'logoFile') {
        formData.append(key, String(value));
      }
    });
    
    if (!editingSponsor && !data.logoFile?.[0]) {
      toast({ title: "Fehler", description: "Ein Logo ist für neue Sponsoren erforderlich.", variant: "destructive" });
      return;
    }

    const isUpdating = !!editingSponsor;
    const url = '/api/admin/sponsoren';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');

      toast({ title: "Erfolg!", description: `Sponsor wurde ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchSponsors();
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }

  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="Sponsoren Verwalten" subtitle="Sponsoren erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>{editingSponsor ? 'Sponsor Bearbeiten' : 'Neuen Sponsor Erstellen'}</CardTitle>
          <CardDescription>
            {editingSponsor ? `Bearbeiten Sie den Sponsor "${editingSponsor.name}".` : 'Füllen Sie die Felder aus, um einen neuen Sponsor hinzuzufügen.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name des Sponsors*</FormLabel><FormControl><Input placeholder="Firmenname GmbH" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="level" render={({ field }) => (<FormItem><FormLabel>Sponsoring-Level*</FormLabel><FormControl><Input placeholder="Hauptsponsor, Partner, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="logoFile" render={({ field: { onChange, ...rest } }) => (<FormItem><FormLabel>Logo* (max 5MB, JPG/PNG/GIF/SVG)</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,image/gif,image/svg+xml" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl><FormDescription>{editingSponsor ? 'Lassen Sie das Feld frei, um das aktuelle Logo beizubehalten. Ein neues Logo ist nur beim Erstellen erforderlich.' : 'Ein Logo ist für neue Sponsoren erforderlich.'}</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="displayOrder" render={({ field }) => (<FormItem><FormLabel>Anzeigereihenfolge</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Niedrigere Zahlen werden zuerst angezeigt.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dataAiHint" render={({ field }) => (<FormItem><FormLabel>Bild KI-Hinweis (Optional)</FormLabel><FormControl><Input placeholder="z.B. company logo, tech brand" {...field} /></FormControl><FormDescription>1-2 Stichworte für KI-Bildgenerierung.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (<FormItem><FormLabel>Webseite URL (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://www.firmenname.de" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitDisabled}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building className="mr-2 h-4 w-4" />}
                        {editingSponsor ? 'Sponsor Aktualisieren' : 'Sponsor Speichern'}
                    </Button>
                    {editingSponsor && (<Button type="button" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>)}
                </div>
              </form>
            </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center"><List className="mr-2"/>Aktuelle Sponsoren</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Sponsoren...</span></div>
          ) : sponsors.length === 0 ? (
            <p className="text-muted-foreground">Keine Sponsoren gefunden.</p>
          ) : (
            <div className="space-y-4">
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                     <Image src={sponsor.logoUrl || "https://placehold.co/100x50.png"} alt={sponsor.name} width={100} height={50} className="rounded-md object-contain" data-ai-hint="company logo"/>
                     <div>
                        <p className="font-semibold">{sponsor.name} <span className="text-xs text-muted-foreground">(Order: {sponsor.displayOrder})</span></p>
                        <p className="text-sm text-muted-foreground">{sponsor.level}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(sponsor)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Der Sponsor "{sponsor.name}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(sponsor.id, sponsor.name)}>Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
