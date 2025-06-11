
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const sponsorFormSchema = z.object({
  id: z.string().min(1, { message: "ID wird benötigt (z.B. eindeutiger Kurzname)." }),
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  level: z.string().min(3, { message: "Sponsoring-Level muss angegeben werden." }),
  logoUrl: z.string().url({ message: "Bitte geben Sie eine gültige URL für das Logo ein." }),
  websiteUrl: z.string().url({ message: "Bitte eine gültige URL eingeben oder leer lassen." }).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

export default function AdminSponsorenPage() {
  const { toast } = useToast();

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      id: "",
      name: "",
      level: "Partner",
      logoUrl: "",
      websiteUrl: "",
      dataAiHint: "",
    },
  });

  const handleUploadClick = () => {
    toast({
      title: "Funktion in Entwicklung",
      description: "Die Möglichkeit, CSV-Dateien hochzuladen, wird in Kürze implementiert.",
      variant: "default",
    });
  };

  function onSubmit(data: SponsorFormValues) {
    console.log(data);
    toast({
      title: "Funktion in Entwicklung",
      description: "Das Hinzufügen von Sponsoren über dieses Formular wird in Kürze implementiert. Bitte bearbeiten Sie vorerst die CSV-Datei.",
    });
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
        <PageHeader title="Sponsoren Verwalten" subtitle="Sponsorenlogos und -informationen verwalten." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Sponsorendaten (sponsors.csv)</CardTitle>
          <CardDescription>
            Hier können Sie die aktuellen Sponsorendaten herunterladen oder eine neue Version hochladen.
            Die Daten werden aus der Datei <code>src/data/sponsoren/sponsors.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/sponsoren" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              sponsors.csv herunterladen
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
          <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Neuen Sponsor Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um einen neuen Sponsor hinzuzufügen. Die Daten werden aktuell noch nicht gespeichert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID* (Eindeutiger Wert)</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. sponsor_firmenname" {...field} />
                    </FormControl>
                    <FormDescription>Eine eindeutige ID für diesen Sponsor.</FormDescription>
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
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL*</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png oder /images/sponsoren/logo.png" {...field} />
                    </FormControl>
                     <FormDescription>Muss eine vollständige URL oder ein Pfad beginnend mit /images/... sein.</FormDescription>
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
                      <Input placeholder="z.B. company logo" {...field} />
                    </FormControl>
                     <FormDescription>1-2 Stichworte für KI-Bildgenerierung, falls kein Bild angegeben.</FormDescription>
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
              <Button type="submit">
                <Building className="mr-2 h-4 w-4" />
                Sponsor Hinzufügen (Platzhalter)
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
