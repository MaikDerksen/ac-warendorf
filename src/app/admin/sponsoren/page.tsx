
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';

const sponsorFormSchema = z.object({
  id: z.string().min(3, { message: "ID muss mindestens 3 Zeichen haben (z.B. sponsor-firmenname)." }).regex(/^[a-z0-9-]+$/, { message: "Nur Kleinbuchstaben, Zahlen und Bindestriche."}),
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  level: z.string().min(3, { message: "Sponsoring-Level muss angegeben werden." }),
  logoFile: z.any()
    .refine(files => files && files.length > 0, "Logodatei ist erforderlich.")
    .refine(files => files && files[0] && files[0].size <= 5 * 1024 * 1024, `Maximale Dateigröße ist 5MB.`)
    .refine(files => files && files[0] && ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(files[0].type), 'Nur JPG, PNG, GIF, SVG erlaubt.'),
  websiteUrl: z.string().url({ message: "Bitte eine gültige URL eingeben oder leer lassen." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, {message: "Maximal 50 Zeichen."}).optional(),
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

export default function AdminSponsorenPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      id: "",
      name: "",
      level: "Partner",
      logoFile: undefined,
      websiteUrl: "",
      dataAiHint: "",
    },
  });

  async function onSubmit(data: SponsorFormValues) {
    if (!user) {
      toast({ title: "Nicht Angemeldet", description: "Bitte melden Sie sich an.", variant: "destructive" });
      return;
    }
    if (!isAdmin) {
      toast({ title: "Keine Berechtigung", description: "Sie haben keine Admin-Berechtigung.", variant: "destructive" });
      return;
    }

    let idToken;
    try {
      idToken = await user.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({ title: "Authentifizierungsfehler", description: "ID Token konnte nicht abgerufen werden.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    (Object.keys(data) as Array<keyof SponsorFormValues>).forEach(key => {
      if (key === 'logoFile' && data.logoFile && data.logoFile.length > 0) {
        formData.append(key, data.logoFile[0]);
      } else if (data[key] !== undefined && data[key] !== null && key !== 'logoFile') {
         formData.append(key, String(data[key]));
      }
    });
    
    const fileInput = document.getElementById('logoFileSponsor') as HTMLInputElement | null;

    try {
      const response = await fetch('/api/admin/sponsoren', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Fehler beim Senden der Daten an den Server.');
      }

      toast({
        title: "Sponsor Verarbeitet!",
        description: (
          <div>
            <p>{result.message}</p>
            {result.firestoreId && <p>Firestore Document ID: {result.firestoreId}</p>}
            {result.logoUrl && <p>Logo URL: <a href={result.logoUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Link</a></p>}
            <p className="mt-2">Die Sponsorenübersicht wurde aktualisiert.</p>
          </div>
        ),
        duration: 10000,
      });
      form.reset({ 
          id: "",
          name: "",
          level: "Partner",
          logoFile: undefined,
          websiteUrl: "",
          dataAiHint: "",
      });
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("Fehler beim Senden des Sponsoren-Formulars:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist beim Verarbeiten des Sponsors aufgetreten.",
        variant: "destructive",
      });
    }
  }
  
  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Sponsoren Verwalten" subtitle="Sponsoren in Firestore erstellen & Logos zu Firebase Storage hochladen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Neuen Sponsor Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Sponsor hinzuzufügen. Logo wird zu Storage, Daten zu Firestore gespeichert.
            Sie müssen als Admin angemeldet sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user && !authLoading && (
            <p className="text-destructive">Bitte melden Sie sich an, um Sponsoren zu erstellen.</p>
          )}
          {user && !isAdmin && !authLoading && (
            <p className="text-destructive">Sie haben keine Admin-Berechtigung.</p>
          )}
          {(user && isAdmin || authLoading) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor ID* (Eindeutig, Kleinbuchstaben, Bindestriche)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. firma-xyz-logo" {...field} />
                      </FormControl>
                      <FormDescription>Eindeutige ID für den Firestore-Eintrag, z.B. 'max-mustermann-ag'.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name des Sponsors*</FormLabel>
                      <FormControl>
                        <Input placeholder="Firmenname GmbH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsoring-Level*</FormLabel>
                      <FormControl>
                        <Input placeholder="Hauptsponsor, Partner, Unterstützer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Logo Hochladen* (max 5MB, JPG/PNG/GIF/SVG)</FormLabel>
                      <FormControl>
                        <Input
                          id="logoFileSponsor"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/svg+xml"
                          onChange={(e) => onChange(e.target.files)}
                          {...rest}
                        />
                      </FormControl>
                      <FormDescription>Wählen Sie eine Logodatei von Ihrem Computer.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataAiHint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bild KI-Hinweis (Optional, für Logo)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. company logo, tech brand" {...field} />
                      </FormControl>
                      <FormDescription>1-2 Stichworte für KI-Bildgenerierung, falls kein Logo vorhanden (Fallback).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webseite URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://www.firmenname.de" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitDisabled}>
                  <Building className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'Sponsor Speichern'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/admin">Zurück zum Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
