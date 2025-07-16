
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FilePlus, Trash2, Edit, Loader2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { NewsArticle } from '@/types';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const newsFormSchema = z.object({
  title: z.string().min(5, { message: "Titel muss mindestens 5 Zeichen haben." }),
  slug: z.string().min(3, { message: "Slug muss mindestens 3 Zeichen haben (z.B. mein-artikel)." }).regex(/^[a-z0-9-]+$/, { message: "Nur Kleinbuchstaben, Zahlen und Bindestriche."}),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Datum muss im Format YYYY-MM-DD sein." }),
  categories: z.string().optional(), 
  excerpt: z.string().min(10, { message: "Kurzbeschreibung muss mindestens 10 Zeichen haben." }),
  content: z.string().min(20, { message: "Inhalt muss mindestens 20 Zeichen haben." }),
  heroImageFile: z.any().optional(),
  youtubeEmbed: z.string().optional(),
  dataAiHint: z.string().max(50, {message: "Maximal 50 Zeichen."}).optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

export default function AdminNewsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth(); 
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: { title: "", slug: "", date: new Date().toISOString().split('T')[0], categories: "", excerpt: "", content: "<p>Ihr Artikelinhalt hier...</p>", heroImageFile: undefined, youtubeEmbed: "", dataAiHint: "" },
  });

  const fetchArticles = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/news');
      if (!response.ok) throw new Error('Artikel konnten nicht geladen werden.');
      const data = await response.json();
      setArticles(data);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchArticles();
    else if (!authLoading) setIsLoading(false);
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (article: NewsArticle) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      slug: article.slug,
      date: article.date,
      categories: article.categories.join('|'),
      excerpt: article.excerpt,
      content: article.content,
      youtubeEmbed: article.youtubeEmbed || "",
      dataAiHint: article.dataAiHint || "",
      heroImageFile: undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingArticle(null);
    form.reset({ title: "", slug: "", date: new Date().toISOString().split('T')[0], categories: "", excerpt: "", content: "<p>Ihr Artikelinhalt hier...</p>", heroImageFile: undefined, youtubeEmbed: "", dataAiHint: "" });
  };
  
  const handleDelete = async (articleId: string) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/news?id=${articleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Artikels.');
        }
        toast({ title: "Erfolg", description: "Artikel wurde gelöscht." });
        fetchArticles(); // Refresh list
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  async function onSubmit(data: NewsFormValues) {
    if (!user || !isAdmin) return;
    
    const idToken = await user.getIdToken();
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'heroImageFile' && value?.[0]) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && key !== 'heroImageFile') {
        formData.append(key, String(value));
      }
    });

    const isUpdating = !!editingArticle;
    const url = isUpdating ? `/api/admin/news?id=${editingArticle.id}` : '/api/admin/news';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');

      toast({ title: "Erfolg!", description: `Artikel wurde ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchArticles(); // Refresh list
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }
  
  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="News Verwalten" subtitle="Artikel erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FilePlus className="mr-2 h-5 w-5 text-primary"/>{editingArticle ? 'Artikel Bearbeiten' : 'Neuen News-Artikel Erstellen'}</CardTitle>
          <CardDescription>
            {editingArticle ? `Bearbeiten Sie den Artikel "${editingArticle.title}".` : 'Füllen Sie die Felder aus, um einen neuen Artikel hinzuzufügen.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titel*</FormLabel><FormControl><Input placeholder="Spannender Artikeltitel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug* (für URL)</FormLabel><FormControl><Input placeholder="spannender-artikeltitel" {...field} value={field.value || ''} disabled={!!editingArticle} /></FormControl><FormDescription>Eindeutig, nur Kleinbuchstaben, Zahlen, Bindestriche. Kann nach Erstellung nicht mehr geändert werden.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Datum* (YYYY-MM-DD)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="categories" render={({ field }) => (<FormItem><FormLabel>Kategorien (getrennt durch | )</FormLabel><FormControl><Input placeholder="Kart-Slalom|Vereinsleben" {...field} value={field.value || ''} /></FormControl><FormDescription>Mehrere Kategorien mit "|" trennen.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="excerpt" render={({ field }) => (<FormItem><FormLabel>Kurzbeschreibung*</FormLabel><FormControl><Textarea placeholder="Eine kurze Zusammenfassung..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Inhalt* (HTML erlaubt)</FormLabel><FormControl><Textarea placeholder="<p>Der vollständige Artikelinhalt...</p>" {...field} value={field.value || ''} rows={10}/></FormControl><FormDescription>Sie können HTML-Tags für Formatierungen verwenden.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="heroImageFile" render={({ field: { onChange, onBlur, name, ref } }) => (<FormItem><FormLabel>Titelbild {editingArticle ? 'ersetzen' : 'hochladen'} (Optional)</FormLabel><FormControl><Input id="heroImageFile" type="file" accept="image/jpeg,image/png,image/gif" onChange={(e) => onChange(e.target.files)} onBlur={onBlur} name={name} ref={ref} /></FormControl><FormDescription>{editingArticle ? 'Lassen Sie das Feld frei, um das aktuelle Bild beizubehalten.' : 'Wählen Sie eine Bilddatei von Ihrem Computer.'}</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="dataAiHint" render={({ field }) => (<FormItem><FormLabel>Bild KI-Hinweis (Optional)</FormLabel><FormControl><Input placeholder="z.B. kart race" {...field} value={field.value || ''} /></FormControl><FormDescription>1-2 Stichworte für KI-Bildgenerierung, falls kein Bild angegeben.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="youtubeEmbed" render={({ field }) => (<FormItem><FormLabel>YouTube Video ID (Optional)</FormLabel><FormControl><Input placeholder="z.B. dQw4w9WgXcQ" {...field} value={field.value || ''} /></FormControl><FormDescription>Nur die ID des Videos, nicht die volle URL.</FormDescription><FormMessage /></FormItem>)} />
              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitDisabled}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingArticle ? <Edit className="mr-2 h-4 w-4" /> : <FilePlus className="mr-2 h-4 w-4" />)}
                    {editingArticle ? 'Artikel Aktualisieren' : 'Artikel Speichern'}
                </Button>
                {editingArticle && (<Button type="button" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>)}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><List className="mr-2"/>Aktuelle News-Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Artikel...</span></div>
          ) : articles.length === 0 ? (
            <p className="text-muted-foreground">Keine Artikel gefunden.</p>
          ) : (
            <div className="space-y-4">
              {articles.map(article => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                     <Image src={article.heroImageUrl || "https://placehold.co/100x75.png"} alt={article.title} width={100} height={75} className="rounded-md object-cover" data-ai-hint="news article"/>
                     <div>
                        <p className="font-semibold">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.slug} - {new Date(article.date).toLocaleDateString('de-DE')}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(article)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel "{article.title}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.id)}>Löschen</AlertDialogAction>
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
