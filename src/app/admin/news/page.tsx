
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
import { useForm, Controller } from "react-hook-form";
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

const newsFormSchema = z.object({
  slug: z.string().min(3, { message: "Slug muss mindestens 3 Zeichen haben (z.B. mein-artikel)." }).regex(/^[a-z0-9-]+$/, { message: "Nur Kleinbuchstaben, Zahlen und Bindestriche."}),
  title: z.string().min(5, { message: "Titel muss mindestens 5 Zeichen haben." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Datum muss im Format YYYY-MM-DD sein." }),
  categories: z.string().optional(), // Pipe-separated
  excerpt: z.string().min(10, { message: "Kurzbeschreibung muss mindestens 10 Zeichen haben." }),
  content: z.string().min(20, { message: "Inhalt muss mindestens 20 Zeichen haben." }), // HTML content
  heroImageFile: z.any() // Changed from z.instanceof(FileList) to z.any() to avoid SSR error
    .optional()
    .refine(files => !files || files.length === 0 || (files[0] && files[0].size <= 5 * 1024 * 1024), `Maximale Dateigröße ist 5MB.`)
    .refine(files => !files || files.length === 0 || (files[0] && ['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)), 'Nur JPG, PNG, GIF erlaubt.'),
  youtubeEmbed: z.string().optional(),
  dataAiHint: z.string().max(50, {message: "Maximal 50 Zeichen."}).optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;


export default function AdminNewsPage() {
  const { toast } = useToast();

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      slug: "",
      title: "",
      date: new Date().toISOString().split('T')[0], // Default to today
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
      title: "Funktion in Entwicklung",
      description: "Die Möglichkeit, CSV-Dateien hochzuladen, wird in Kürze implementiert.",
      variant: "default",
    });
  };

  async function onSubmit(data: NewsFormValues) {
    const formData = new FormData();
    (Object.keys(data) as Array<keyof NewsFormValues>).forEach(key => {
      if (key === 'heroImageFile' && data.heroImageFile && data.heroImageFile.length > 0) {
        formData.append(key, data.heroImageFile[0]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key] as string); // FormData values are string or Blob/File
      }
    });

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Fehler beim Senden der Daten.');
      }

      toast({
        title: "News Artikel (Simuliert) Hinzugefügt!",
        description: "Der Artikel wurde erfolgreich (simuliert) verarbeitet. Details in der Server-Konsole. Die Live-Aktualisierung der CSV-Datei ist nicht Teil dieser Demo.",
      });
      form.reset();
       // Manually reset file input as form.reset() might not clear it
      const fileInput = document.getElementById('heroImageFile') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error("Fehler beim Senden des Formulars:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
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
        <PageHeader title="News Verwalten" subtitle="Artikel erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktuelle News-Daten (news.csv)</CardTitle>
          <CardDescription>
            Hier können Sie die aktuellen News-Daten herunterladen. Das Hochladen einer neuen CSV-Version ist in Entwicklung.
            Die News-Daten werden aus der Datei <code>src/data/news/news.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/news" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              news.csv herunterladen
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Laden Sie die aktuelle CSV-Datei herunter, um sie extern zu bearbeiten oder als Backup zu sichern.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-4 border-t mt-4">
            <Input type="file" accept=".csv" className="flex-grow" disabled />
            <Button onClick={handleLegacyUploadClick} className="w-full sm:w-auto" disabled>
              <UploadCloud className="mr-2 h-4 w-4" />
              CSV Hochladen (In Entwicklung)
            </Button>
          </div>
           <p className="text-xs text-muted-foreground pt-1">
            <strong>Hinweis Upload:</strong> Diese Funktion ist noch in Entwicklung.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FilePlus className="mr-2 h-5 w-5 text-primary"/>Neuen News-Artikel Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Artikel hinzuzufügen. Das Speichern ist simuliert.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                render={({ field: { onChange, value, ...rest } }) => ( // Ensure value is not spread to input
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
                        {...rest} // Spread the rest of the field props here
                      />
                    </FormControl>
                    <FormDescription>Wählen Sie eine Bilddatei von Ihrem Computer.</FormDescription>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <FilePlus className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'News-Artikel Hinzufügen (Simuliert)'}
              </Button>
            </form>
          </Form>
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
