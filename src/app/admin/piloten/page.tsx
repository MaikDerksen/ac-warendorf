
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Edit, Trash2, Loader2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { Pilot } from '@/types';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const pilotFormSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  profileSlug: z.string().optional().transform(val => val ? val.toLowerCase().replace(/\s+/g, '-') : undefined),
  imageFile: z.any().optional(),
  bio: z.string().optional(),
  achievements: z.string().optional(),
});

type PilotFormValues = z.infer<typeof pilotFormSchema>;

export default function AdminPilotenPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PilotFormValues>({
    resolver: zodResolver(pilotFormSchema),
    defaultValues: { name: "", profileSlug: "", imageFile: undefined, bio: "", achievements: "" },
  });
  
  const fetchPilots = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/piloten');
      if (!response.ok) throw new Error('Piloten konnten nicht geladen werden.');
      const data = await response.json();
      setPilots(data);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchPilots();
    else if (!authLoading) setIsLoading(false);
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (pilot: Pilot) => {
    setEditingPilot(pilot);
    form.reset({
      name: pilot.name,
      profileSlug: pilot.profileSlug || "",
      bio: pilot.bio || "",
      achievements: pilot.achievements?.join('|') || "",
      imageFile: undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingPilot(null);
    form.reset({ name: "", profileSlug: "", imageFile: undefined, bio: "", achievements: "" });
  };
  
  const handleDelete = async (pilotId: string, pilotName: string) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/piloten?id=${pilotId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Piloten.');
        }
        toast({ title: "Erfolg", description: `Pilot ${pilotName} wurde gelöscht.` });
        fetchPilots();
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  async function onSubmit(data: PilotFormValues) {
    if (!user || !isAdmin) return;
    
    const idToken = await user.getIdToken();
    const formData = new FormData();
    (Object.keys(data) as Array<keyof PilotFormValues>).forEach(key => {
      const value = data[key];
      if (key === 'imageFile' && value?.[0]) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && key !== 'imageFile') {
        formData.append(key, String(value));
      }
    });

    const isUpdating = !!editingPilot;
    const url = isUpdating ? `/api/admin/piloten?id=${editingPilot.id}` : '/api/admin/piloten';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');

      toast({ title: "Erfolg!", description: `Pilot wurde ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchPilots();
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }

  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="Piloten Verwalten" subtitle="Fahrerprofile erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary"/>{editingPilot ? 'Pilot Bearbeiten' : 'Neuen Piloten Erstellen'}</CardTitle>
          <CardDescription>
            {editingPilot ? `Bearbeiten Sie das Profil für "${editingPilot.name}".` : 'Füllen Sie die Felder aus, um einen neuen Piloten hinzuzufügen.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name des Piloten*</FormLabel><FormControl><Input placeholder="Max Mustermann" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="profileSlug" render={({ field }) => (<FormItem><FormLabel>Profil Slug (Optional)</FormLabel><FormControl><Input placeholder="max-mustermann" {...field} value={field.value || ''} /></FormControl><FormDescription>Wird für die URL des Profils verwendet. Wenn leer, wird kein Profil erstellt.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="imageFile" render={({ field: { onChange, onBlur, name, ref } }) => (<FormItem><FormLabel>Bild {editingPilot ? 'ersetzen' : 'hochladen'} (Optional)</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,image/gif" onBlur={onBlur} name={name} ref={ref} onChange={(e) => onChange(e.target.files)} /></FormControl><FormDescription>{editingPilot ? 'Lassen Sie das Feld frei, um das aktuelle Bild beizubehalten.' : 'Wählen Sie eine Bilddatei.'}</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio (Optional)</FormLabel><FormControl><Textarea placeholder="Kurze Beschreibung des Piloten..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="achievements" render={({ field }) => (<FormItem><FormLabel>Erfolge (Optional, getrennt durch | )</FormLabel><FormControl><Textarea placeholder="Erster Platz Meisterschaft X|Zweiter Platz Rennen Y" {...field} value={field.value || ''} /></FormControl><FormDescription>Jeden Erfolg mit einem | trennen.</FormDescription><FormMessage /></FormItem>)} />
                
                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitDisabled}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingPilot ? <Edit className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
                        {editingPilot ? 'Pilot Aktualisieren' : 'Pilot Speichern'}
                    </Button>
                    {editingPilot && (<Button type="button" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>)}
                </div>
              </form>
            </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><List className="mr-2"/>Aktuelle Piloten</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Piloten...</span></div>
          ) : pilots.length === 0 ? (
            <p className="text-muted-foreground">Keine Piloten gefunden.</p>
          ) : (
            <div className="space-y-4">
              {pilots.map(pilot => (
                <div key={pilot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                     <Image src={pilot.imageUrl || "https://placehold.co/80x80.png"} alt={pilot.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint="person photo"/>
                     <div>
                        <p className="font-semibold">{pilot.name}</p>
                        <p className="text-sm text-muted-foreground">{pilot.profileSlug || "(Kein Slug)"}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(pilot)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Der Pilot "{pilot.name}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(pilot.id, pilot.name)}>Löschen</AlertDialogAction>
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
