
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, UploadCloud, UserCog } from 'lucide-react';
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

const boardMemberFormSchema = z.object({
  id: z.string().min(1, { message: "ID wird benötigt (z.B. eindeutiger Kurzname)." }),
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  role: z.string().min(3, { message: "Rolle muss angegeben werden." }),
  term: z.string().optional(),
  email: z.string().email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  imageFile: z.any().optional(), // For file upload
  slug: z.string().optional(),
  description: z.string().optional(),
});

type BoardMemberFormValues = z.infer<typeof boardMemberFormSchema>;

export default function AdminVorstandPage() {
  const { toast } = useToast();

  const form = useForm<BoardMemberFormValues>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: {
      id: "",
      name: "",
      role: "",
      term: "",
      email: "",
      imageFile: undefined,
      slug: "",
      description: "",
    },
  });

  const handleUploadClick = () => {
    toast({
      title: "Funktion in Entwicklung",
      description: "Die Möglichkeit, CSV-Dateien hochzuladen, wird in Kürze implementiert.",
      variant: "default",
    });
  };

  function onSubmit(data: BoardMemberFormValues) {
    console.log(data);
    if (data.imageFile && data.imageFile.length > 0) {
      console.log("Selected file:", data.imageFile[0].name);
    }
    toast({
      title: "Funktion in Entwicklung",
      description: "Das Hinzufügen von Vorstandsmitgliedern über dieses Formular (inkl. Datei-Upload) wird in Kürze implementiert. Bitte bearbeiten Sie vorerst die CSV-Datei.",
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
        <PageHeader title="Vorstand Verwalten" subtitle="Vorstandsmitglieder und Rollen pflegen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Vorstandsdaten (board-members.csv)</CardTitle>
          <CardDescription>
            Hier können Sie die aktuellen Vorstandsdaten herunterladen oder eine neue Version hochladen.
            Die Daten werden aus der Datei <code>src/data/vorstand/board-members.csv</code> geladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/vorstand" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              board-members.csv herunterladen
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
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary"/>Neues Vorstandsmitglied Erstellen</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus, um ein neues Mitglied hinzuzufügen. Die Daten werden aktuell noch nicht gespeichert.
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
                      <Input placeholder="z.B. max_mustermann_vorstand" {...field} />
                    </FormControl>
                    <FormDescription>Eine eindeutige ID für dieses Mitglied.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle / Funktion*</FormLabel>
                    <FormControl>
                      <Input placeholder="1. Vorsitzender" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="max.mustermann[at]example.com" {...field} />
                    </FormControl>
                    <FormDescription>Bitte [at] anstelle von @ verwenden, es wird automatisch ersetzt.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amtszeit (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. 2023-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bild Hochladen (Optional)</FormLabel>
                    <FormControl>
                       <Input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => field.onChange(e.target.files)}
                        ref={field.ref}
                       />
                    </FormControl>
                    <FormDescription>Wählen Sie eine Bilddatei des Mitglieds von Ihrem Computer.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Zusätzliche Informationen über das Mitglied..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <UserCog className="mr-2 h-4 w-4" />
                Vorstandsmitglied Hinzufügen (Platzhalter)
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
