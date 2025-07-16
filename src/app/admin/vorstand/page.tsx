
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserCog, Edit, Trash2, Loader2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { BoardMember } from '@/types';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const boardMemberFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben."),
  role: z.string().min(3, "Rolle muss angegeben werden."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  term: z.string().optional(),
  description: z.string().optional(),
  imageFile: z.any().optional(),
  order: z.coerce.number().optional(),
});

type BoardMemberFormValues = z.infer<typeof boardMemberFormSchema>;

export default function AdminVorstandPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<BoardMemberFormValues>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: { name: "", role: "", email: "", term: "", description: "", imageFile: undefined, order: 99 },
  });

  const fetchMembers = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/vorstand');
      if (!response.ok) throw new Error('Mitglieder konnten nicht geladen werden.');
      const data = await response.json();
      setMembers(data);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchMembers();
    else if (!authLoading) setIsLoading(false);
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (member: BoardMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      role: member.role,
      email: member.email,
      term: member.term || "",
      description: member.description || "",
      order: member.order || 99,
      imageFile: undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    form.reset({ name: "", role: "", email: "", term: "", description: "", imageFile: undefined, order: 99 });
  };
  
  const handleDelete = async (memberId: string, memberName: string) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/vorstand?id=${memberId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Mitglieds.');
        }
        toast({ title: "Erfolg", description: `Mitglied ${memberName} wurde gelöscht.` });
        fetchMembers();
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  async function onSubmit(data: BoardMemberFormValues) {
    if (!user || !isAdmin) return;
    
    const idToken = await user.getIdToken();
    const formData = new FormData();
    const memberId = editingMember ? editingMember.id : data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    formData.append('id', memberId);

    (Object.keys(data) as Array<keyof BoardMemberFormValues>).forEach(key => {
      const value = data[key];
      if (key === 'imageFile' && value?.[0]) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && key !== 'imageFile') {
        formData.append(key, String(value));
      }
    });

    const isUpdating = !!editingMember;
    const url = '/api/admin/vorstand'; // Same URL for POST and PUT
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');

      toast({ title: "Erfolg!", description: `Mitglied wurde ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }

  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="Vorstand Verwalten" subtitle="Mitglieder erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary"/>{editingMember ? 'Mitglied Bearbeiten' : 'Neues Vorstandsmitglied Erstellen'}</CardTitle>
          <CardDescription>
            {editingMember ? `Bearbeiten Sie die Daten für "${editingMember.name}".` : 'Füllen Sie die Felder aus, um ein neues Mitglied hinzuzufügen.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name*</FormLabel><FormControl><Input placeholder="Max Mustermann" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Rolle / Funktion*</FormLabel><FormControl><Input placeholder="1. Vorsitzender" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-Mail*</FormLabel><FormControl><Input type="email" placeholder="max.mustermann[at]ac-warendorf.de" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="term" render={({ field }) => (<FormItem><FormLabel>Amtszeit (Optional)</FormLabel><FormControl><Input placeholder="z.B. 2023-2025" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="order" render={({ field }) => (<FormItem><FormLabel>Anzeigereihenfolge</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} /></FormControl><FormDescription>Eine niedrigere Zahl bedeutet eine frühere Anzeige (z.B. 1 für 1. Vorsitzender).</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Beschreibung (Optional)</FormLabel><FormControl><Textarea placeholder="Zusätzliche Informationen..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="imageFile" render={({ field: { onChange, onBlur, name, ref } }) => (<FormItem><FormLabel>Bild {editingMember ? 'ersetzen' : 'hochladen'} (Optional)</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,image/gif" onBlur={onBlur} name={name} ref={ref} onChange={(e) => onChange(e.target.files)} /></FormControl><FormDescription>{editingMember ? 'Lassen Sie das Feld frei, um das aktuelle Bild beizubehalten.' : 'Wählen Sie eine Bilddatei.'}</FormDescription><FormMessage /></FormItem>)} />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCog className="mr-2 h-4 w-4" />}
                    {editingMember ? 'Mitglied Aktualisieren' : 'Mitglied Speichern'}
                  </Button>
                  {editingMember && (<Button type="button" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>)}
                </div>
              </form>
            </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center"><List className="mr-2"/>Aktuelle Vorstandsmitglieder</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Mitglieder...</span></div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground">Keine Mitglieder gefunden.</p>
          ) : (
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                     <Image src={member.imageUrl || "https://placehold.co/80x80.png"} alt={member.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint="person photo"/>
                     <div>
                        <p className="font-semibold">{member.name} <span className="text-xs text-muted-foreground">(Order: {member.order})</span></p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(member)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Das Mitglied "{member.name}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(member.id, member.name)}>Löschen</AlertDialogAction>
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
