
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud, UserPlus } from 'lucide-react';
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

const pilotFormSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  profileSlug: z.string().optional(),
  imageUrl: z.string().url({ message: "Bitte geben Sie eine gültige URL für das Bild ein." }).optional().or(z.literal('')),
  bio: z.string().optional(),
  achievements: z.string().optional(), // Pipe-separated
});

type PilotFormValues = z.infer<typeof pilotFormSchema>;

export default function AdminPilotenPage() {
  const { toast } = useToast();

  const form = useForm<PilotFormValues>({
    resolver: zodResolver(pilotFormSchema),
    defaultValues: {
      name: "",
      profileSlug: "",
      imageUrl: "",
      bio: "",
      achievements: "",
    },
  });

  const handleUploadClick = () => {
    toast({
      title: "Funktion in Entwicklung",
      description: "Die Möglichkeit, CSV-Dateien hochzuladen, wird in Kürze implementiert.",
      variant: "default",
    });
  };

  function onSubmit(data: PilotFormValues) {
    console.log(data);
    toast({
      title: "Funktion in Entwicklung",
      description: "Das Hinzufügen von Piloten über dieses Formular wird in Kürze implementiert. Bitte bearbeiten Sie vorerst die CSV-Datei.",
    });
    // form.reset(); // Optionally reset form
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
        <PageHeader title="Piloten Verwalten" subtitle="Fahrerprofile und Erfolge aktualisieren." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Pilotendaten (pilots.csv)</CardTitle>
          <CardDescription>
            Hier können Sie die aktuellen Pilotendaten herunterladen oder eine neue Version hochladen.
            Die Daten werden aus der Datei <code>src/data/pilots/pilots.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/piloten" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              pilots.csv herunterladen
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Laden Sie die aktuelle CSV-Datei herunter, um sie extern zu bearbeiten.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-4 border-t mt-4">
            <Input type="file" accept=".csv" className="flex-grow" />
            <Button onClick={handleUploadClick} className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              CSV Hochladen
            </Button>
          </div>
           <p className="text-xs text-muted-foreground pt-1">
            <strong>Hinweis Upload:</strong> Diese Funktion ist noch in Entwicklung. Das Hochladen einer Datei hier hat aktuell keine Auswirkungen.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary"/>Neuen Piloten Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Piloten hinzuzufügen. Die Daten werden aktuell noch nicht gespeichert (Funktion in Entwicklung).
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <FormDescription>Wird für die URL des Profils verwendet. Wenn leer, wird kein Profil erstellt.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bild URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/bild.jpg oder /images/pilots/bild.jpg" {...field} />
                    </FormControl>
                    <FormDescription>URL zum Bild des Piloten. Muss eine vollständige URL oder ein Pfad beginnend mit /images/... sein.</FormDescription>
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
              <Button type="submit">
                <UserPlus className="mr-2 h-4 w-4" />
                Piloten Hinzufügen (Platzhalter)
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
