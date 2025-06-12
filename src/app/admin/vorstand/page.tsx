
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
import { useAuth } from '@/context/AuthContext';

const boardMemberFormSchema = z.object({
  id: z.string().min(3, { message: "ID muss mind. 3 Zeichen haben (z.B. max-mustermann)."}).regex(/^[a-z0-9-]+$/, { message: "Nur Kleinbuchstaben, Zahlen, Bindestriche."}),
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  role: z.string().min(3, { message: "Rolle muss angegeben werden." }),
  email: z.string().email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  term: z.string().optional(),
  slug: z.string().optional().transform(val => val ? val.toLowerCase().replace(/\s+/g, '-') : undefined),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).optional().default(0),
  imageFile: z.any()
    .optional()
    .refine(files => !files || files.length === 0 || (files[0] && files[0].size <= 5 * 1024 * 1024), `Maximale Dateigröße ist 5MB.`)
    .refine(files => !files || files.length === 0 || (files[0] && ['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)), 'Nur JPG, PNG, GIF erlaubt.'),
});

type BoardMemberFormValues = z.infer<typeof boardMemberFormSchema>;

export default function AdminVorstandPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const form = useForm<BoardMemberFormValues>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: {
      id: "",
      name: "",
      role: "",
      email: "",
      term: "",
      slug: "",
      description: "",
      order: 0,
      imageFile: undefined,
    },
  });

  const handleLegacyUploadClick = () => {
    toast({
      title: "Funktion für Legacy CSV Veraltet",
      description: "Vorstandsdaten werden nun direkt in Firestore gespeichert. Der Upload von CSVs ist nicht mehr vorgesehen.",
      variant: "default",
    });
  };

  async function onSubmit(data: BoardMemberFormValues) {
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
    (Object.keys(data) as Array<keyof BoardMemberFormValues>).forEach(key => {
      if (key === 'imageFile' && data.imageFile && data.imageFile.length > 0) {
        formData.append(key, data.imageFile[0]);
      } else if (data[key] !== undefined && data[key] !== null && key !== 'imageFile') {
         formData.append(key, String(data[key]));
      }
    });
    
    const fileInput = document.getElementById('imageFileBoardMember') as HTMLInputElement | null;

    try {
      const response = await fetch('/api/admin/vorstand', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Fehler beim Senden der Daten an den Server.');
      }

      toast({
        title: "Vorstandsmitglied Verarbeitet!",
        description: (
          <div>
            <p>{result.message}</p>
            {result.firestoreId && <p>Firestore Document ID: {result.firestoreId}</p>}
            {result.imageUrl && <p>Bild URL: <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Link</a></p>}
            <p className="mt-2">Die Vorstandsübersicht wurde aktualisiert.</p>
          </div>
        ),
        duration: 10000,
      });
      form.reset();
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("Fehler beim Senden des Vorstands-Formulars:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist beim Verarbeiten des Vorstandsmitglieds aufgetreten.",
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
        <PageHeader title="Vorstand Verwalten" subtitle="Vorstandsmitglieder in Firestore erstellen & Bilder zu Storage hochladen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legacy Vorstandsdaten (board-members.csv)</CardTitle>
          <CardDescription>
            Die Webseite liest Vorstandsdaten nun aus Firestore. Die CSV-Datei ist nur noch als Backup relevant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/api/download/vorstand" passHref legacyBehavior>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              board-members.csv herunterladen (Legacy)
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
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary"/>Neues Vorstandsmitglied Erstellen/Aktualisieren</CardTitle>
          <CardDescription>
            Füllen Sie die Felder aus. Wenn die ID existiert, wird der Eintrag aktualisiert. Admin-Login erforderlich.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user && !authLoading && (
            <p className="text-destructive">Bitte melden Sie sich an.</p>
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
                      <FormLabel>ID* (Eindeutig, Kleinbuchstaben, Bindestriche)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. max-mustermann" {...field} />
                      </FormControl>
                      <FormDescription>Eindeutige ID für den Firestore-Eintrag. Wird auch für den Slug verwendet, falls dieser leer ist.</FormDescription>
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
                      <FormDescription>Bitte [at] anstelle von @ verwenden, es wird bei Anzeige ersetzt.</FormDescription>
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil Slug (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="max-mustermann-profil" {...field} />
                      </FormControl>
                     <FormDescription>Wenn leer, wird ID verwendet. Nur Kleinbuchstaben, Zahlen, Bindestriche.</FormDescription>
                    <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anzeigereihenfolge (Optional, Zahl)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormDescription>Niedrigere Zahlen werden zuerst angezeigt.</FormDescription>
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
                        <Textarea placeholder="Zusätzliche Informationen..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { onChange, value, ...rest }}) => (
                    <FormItem>
                      <FormLabel>Bild Hochladen (Optional, max 5MB, JPG/PNG/GIF)</FormLabel>
                      <FormControl>
                       <Input 
                        id="imageFileBoardMember"
                        type="file" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => onChange(e.target.files)}
                        {...rest}
                       />
                    </FormControl>
                    <FormDescription>Wählen Sie eine Bilddatei. Wird zu Firebase Storage hochgeladen.</FormDescription>
                    <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitDisabled}>
                  <UserCog className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'Vorstandsmitglied Speichern'}
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
