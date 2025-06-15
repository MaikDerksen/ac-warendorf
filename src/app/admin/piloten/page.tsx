
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const pilotFormSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  profileSlug: z.string().optional().transform(val => val ? val.toLowerCase().replace(/\s+/g, '-') : undefined),
  imageFile: z.any()
    .optional()
    .refine(files => !files || files.length === 0 || (files[0] && files[0].size <= 5 * 1024 * 1024), `Maximale Dateigröße ist 5MB.`)
    .refine(files => !files || files.length === 0 || (files[0] && ['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)), 'Nur JPG, PNG, GIF erlaubt.'),
  bio: z.string().optional(),
  achievements: z.string().optional(), 
});

type PilotFormValues = z.infer<typeof pilotFormSchema>;

export default function AdminPilotenPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth(); 

  const form = useForm<PilotFormValues>({
    resolver: zodResolver(pilotFormSchema),
    defaultValues: {
      name: "",
      profileSlug: "",
      imageFile: undefined,
      bio: "",
      achievements: "",
    },
  });

  async function onSubmit(data: PilotFormValues) {
    if (!user) {
      toast({
        title: "Nicht Angemeldet",
        description: "Bitte melden Sie sich an, um einen Piloten zu erstellen.",
        variant: "destructive",
      });
      return;
    }
     if (!isAdmin) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Piloten zu erstellen.",
        variant: "destructive",
      });
      return;
    }

    let idToken;
    try {
      idToken = await user.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({
        title: "Authentifizierungsfehler",
        description: "ID Token konnte nicht abgerufen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    (Object.keys(data) as Array<keyof PilotFormValues>).forEach(key => {
      if (key === 'imageFile' && data.imageFile && data.imageFile.length > 0) {
        formData.append(key, data.imageFile[0]);
      } else if (data[key] !== undefined && data[key] !== null && key !== 'imageFile') {
         formData.append(key, String(data[key]));
      }
    });

    try {
      const response = await fetch('/api/admin/piloten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Fehler beim Senden der Daten an den Server.');
      }

      toast({
        title: "Pilot Verarbeitet!",
        description: (
          <div>
            <p>{result.message}</p>
            {result.firestoreId && <p>Firestore Document ID: {result.firestoreId}</p>}
            {result.imageUrl && result.imageUrl.startsWith('https://firebasestorage.googleapis.com') && (
              <p>Bild in Firebase Storage: <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Link</a></p>
            )}
             <p className="mt-2 font-semibold">Wichtiger Hinweis:</p>
            <p>Der Pilot wurde zu Firestore hinzugefügt. Die Pilotenseiten lesen nun direkt aus Firestore.</p>
            {result.imageUrl && result.imageUrl.startsWith('https://firebasestorage.googleapis.com')
              ? <p>Das Bild wurde zu Firebase Storage hochgeladen.</p>
              : result.imageUrl === 'No image uploaded or saved.'
                ? <p>Es wurde kein Bild hochgeladen.</p>
                : <p>Bildpfad (Legacy): {result.imageUrl}</p>
            }
          </div>
        ),
        duration: 12000,
      });
      form.reset();
      const fileInput = document.getElementById('imageFilePilot') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error("Fehler beim Senden des Piloten-Formulars:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist beim Verarbeiten des Piloten aufgetreten.",
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
            <span className="sr-only">Zurück zum Admin Dashboard</span>
          </Link>
        </Button>
        <PageHeader title="Piloten Verwalten" subtitle="Fahrerprofile und Erfolge aktualisieren (speichert in Firestore & Firebase Storage)." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary"/>Neuen Piloten Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Piloten hinzuzufügen. Das Bild wird zu Firebase Storage hochgeladen und der Pilot in Firestore gespeichert.
             Sie müssen als Admin angemeldet sein, um diese Funktion zu nutzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {!user && !authLoading && (
            <p className="text-destructive">Bitte melden Sie sich an, um Piloten zu erstellen.</p>
          )}
          {user && !isAdmin && !authLoading && (
            <p className="text-destructive">Sie haben keine Admin-Berechtigung, um Piloten zu erstellen.</p>
          )}
          {(user && isAdmin || authLoading) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name des Piloten*</FormLabel>
                      <FormControl>
                        <Input placeholder="Max Mustermann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profileSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil Slug (Optional, z.B. max-mustermann)</FormLabel>
                      <FormControl>
                        <Input placeholder="max-mustermann" {...field} />
                      </FormControl>
                      <FormDescription>Wird für die URL des Profils verwendet. Wenn leer, wird kein Profil erstellt. Nur Kleinbuchstaben, Zahlen und Bindestriche.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Bild Hochladen (Optional, max 5MB, JPG/PNG/GIF)</FormLabel>
                      <FormControl>
                        <Input
                          id="imageFilePilot"
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...rest}
                        />
                      </FormControl>
                      <FormDescription>Wählen Sie eine Bilddatei des Piloten von Ihrem Computer.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Kurze Beschreibung des Piloten..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erfolge (Optional, getrennt durch | Zeichen)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Erster Platz Meisterschaft X|Zweiter Platz Rennen Y" {...field} />
                      </FormControl>
                      <FormDescription>Jeden Erfolg mit einem | trennen.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitDisabled}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'Piloten Speichern'}
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
