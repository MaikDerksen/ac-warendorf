
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud, FilePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
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
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const newsFormSchema = z.object({
  slug: z.string().min(3, { message: "Slug muss mindestens 3 Zeichen haben (z.B. mein-artikel)." }).regex(/^[a-z0-9-]+$/, { message: "Nur Kleinbuchstaben, Zahlen und Bindestriche."}),
  title: z.string().min(5, { message: "Titel muss mindestens 5 Zeichen haben." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Datum muss im Format YYYY-MM-DD sein." }),
  categories: z.string().optional(), // Pipe-separated
  excerpt: z.string().min(10, { message: "Kurzbeschreibung muss mindestens 10 Zeichen haben." }),
  content: z.string().min(20, { message: "Inhalt muss mindestens 20 Zeichen haben." }),
  heroImageFile: z.any()
    .optional()
    .refine(files => !files || files.length === 0 || (files[0] && files[0].size <= 5 * 1024 * 1024), `Maximale Dateigröße ist 5MB.`)
    .refine(files => !files || files.length === 0 || (files[0] && ['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)), 'Nur JPG, PNG, GIF erlaubt.'),
  youtubeEmbed: z.string().optional(),
  dataAiHint: z.string().max(50, {message: "Maximal 50 Zeichen."}).optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;


export default function AdminNewsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth(); // Get user and isAdmin status

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      slug: "",
      title: "",
      date: new Date().toISOString().split('T')[0],
      categories: "",
      excerpt: "",
      content: "<p>Ihr Artikelinhalt hier...</p>",
      heroImageFile: undefined,
      youtubeEmbed: "",
      dataAiHint: "",
    },
  });

  const handleLegacyUploadClick = () => {
    toast({
      title: "Funktion für Legacy CSV Veraltet",
      description: "News werden nun direkt in Firestore gespeichert. Der Upload von CSVs für News ist nicht mehr vorgesehen.",
      variant: "default",
    });
  };

  async function onSubmit(data: NewsFormValues) {
    if (!user) {
      toast({
        title: "Nicht Angemeldet",
        description: "Bitte melden Sie sich an, um einen Artikel zu erstellen.",
        variant: "destructive",
      });
      return;
    }
    if (!isAdmin) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Artikel zu erstellen.",
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
    (Object.keys(data) as Array<keyof NewsFormValues>).forEach(key => {
      if (key === 'heroImageFile' && data.heroImageFile && data.heroImageFile.length > 0) {
        formData.append(key, data.heroImageFile[0]);
      } else if (data[key] !== undefined && data[key] !== null && key !== 'heroImageFile') {
         formData.append(key, String(data[key]));
      }
    });

    try {
      const response = await fetch('/api/admin/news', {
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
        title: "News Artikel Verarbeitet!",
        description: (
          <div>
            <p>{result.message}</p>
            {result.firestoreId && <p>Firestore Document ID: {result.firestoreId}</p>}
            {result.imagePath && result.imagePath.startsWith('https://firebasestorage.googleapis.com') && (
              <p>Bild in Firebase Storage: <a href={result.imagePath} target="_blank" rel="noopener noreferrer" className="text-primary underline">Link</a></p>
            )}
            <p className="mt-2 font-semibold">Wichtiger Hinweis:</p>
            <p>Der Artikel wurde zu Firestore hinzugefügt. Die News-Seiten lesen nun direkt aus Firestore.</p>
            {result.imagePath && result.imagePath.startsWith('https://firebasestorage.googleapis.com')
              ? <p>Das Bild wurde zu Firebase Storage hochgeladen.</p>
              : result.imagePath === 'No image uploaded or saved.'
                ? <p>Es wurde kein Bild hochgeladen.</p>
                : <p>Bildpfad (Legacy): {result.imagePath}</p>
            }
          </div>
        ),
        duration: 12000,
      });
      form.reset();
      const fileInput = document.getElementById('heroImageFile') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error("Fehler beim Senden des News-Formulars:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist beim Verarbeiten des Artikels aufgetreten.",
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
        <PageHeader title="News Verwalten" subtitle="Artikel erstellen (speichert in Firestore & Firebase Storage)." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legacy News-Daten (news.csv)</CardTitle>
          <CardDescription>
            Die Webseite liest News-Artikel nun aus Firestore. Die CSV-Datei ist nur noch als Backup oder für historische Daten relevant.
            Ein direkter Upload von CSVs für News ist nicht mehr vorgesehen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/news" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              news.csv herunterladen (Legacy)
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-4 border-t mt-4">
            <Input type="file" accept=".csv" className="flex-grow" disabled />
            <Button onClick={handleLegacyUploadClick} className="w-full sm:w-auto" disabled>
              <UploadCloud className="mr-2 h-4 w-4" />
              CSV Hochladen (Veraltet)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FilePlus className="mr-2 h-5 w-5 text-primary"/>Neuen News-Artikel Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Artikel hinzuzufügen. Das Bild wird zu Firebase Storage hochgeladen und der Artikel in Firestore gespeichert.
            Sie müssen als Admin angemeldet sein, um diese Funktion zu nutzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user && !authLoading && (
            <p className="text-destructive">Bitte melden Sie sich an, um Artikel zu erstellen.</p>
          )}
          {user && !isAdmin && !authLoading && (
            <p className="text-destructive">Sie haben keine Admin-Berechtigung, um Artikel zu erstellen.</p>
          )}
          {(user && isAdmin || authLoading) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel*</FormLabel>
                      <FormControl>
                        <Input placeholder="Spannender Artikeltitel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug* (für URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="spannender-artikeltitel" {...field} />
                      </FormControl>
                      <FormDescription>Kurzer, URL-freundlicher Name. Nur Kleinbuchstaben, Zahlen und Bindestriche.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum* (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorien (Optional, getrennt durch | )</FormLabel>
                      <FormControl>
                        <Input placeholder="Kart-Slalom|Vereinsleben" {...field} />
                      </FormControl>
                      <FormDescription>Mehrere Kategorien mit "|" trennen, z.B. Kart-Slalom|Vereinsleben.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurzbeschreibung / Auszug*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Eine kurze Zusammenfassung des Artikels..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inhalt* (HTML erlaubt)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="<p>Der vollständige Artikelinhalt...</p>" {...field} rows={10}/>
                      </FormControl>
                      <FormDescription>Sie können hier HTML-Tags für Formatierungen verwenden.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heroImageFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Titelbild Hochladen (Optional, max 5MB, JPG/PNG/GIF)</FormLabel>
                      <FormControl>
                        <Input
                          id="heroImageFile"
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...rest}
                        />
                      </FormControl>
                      <FormDescription>Wählen Sie eine Bilddatei von Ihrem Computer. Wird zu Firebase Storage hochgeladen.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataAiHint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bild KI-Hinweis (Optional, für Titelbild)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. kart race" {...field} />
                      </FormControl>
                      <FormDescription>1-2 Stichworte für KI-Bildgenerierung, falls kein Bild angegeben.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtubeEmbed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. dQw4w9WgXcQ" {...field} />
                      </FormControl>
                      <FormDescription>Nur die ID des Videos, nicht die volle URL.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitDisabled}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'News-Artikel Speichern'}
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
