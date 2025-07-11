
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus, Trash2, Edit, Loader2, List, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { CalendarEvent, EventCategory } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';

const eventCategories: EventCategory[] = ['Training', 'Rennen', 'Sitzung', 'Feier', 'Arbeitseinsatz', 'Sonstiges'];

const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Titel muss mindestens 3 Zeichen haben." }),
  allDay: z.boolean().default(false),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(eventCategories),
}).refine(data => {
    const startDateTime = new Date(`${data.startDate}T${data.allDay ? '00:00' : data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.allDay ? '23:59' : data.endTime}`);
    return endDateTime >= startDateTime;
}, {
    message: "Das Enddatum muss nach dem Startdatum liegen.",
    path: ["endDate"], // path to show the error
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function AdminCalendarPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth(); 
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { 
        title: "", 
        allDay: false,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'), // 1 hour later
        location: "", 
        description: "", 
        category: "Sonstiges",
    },
  });

  const fetchEvents = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/calendar');
      if (!response.ok) throw new Error('Termine konnten nicht geladen werden.');
      const data = await response.json();
      setEvents(data);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEvents();
    else if (!authLoading) setIsLoading(false);
  }, [user, isAdmin, authLoading]);

  const handleEditClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    form.reset({
      title: event.title,
      allDay: event.allDay,
      startDate: format(start, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm'),
      endDate: format(end, 'yyyy-MM-dd'),
      endTime: format(end, 'HH:mm'),
      location: event.location || "",
      description: event.description || "",
      category: event.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingEvent(null);
    form.reset({
        title: "", 
        allDay: false,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
        location: "", 
        description: "", 
        category: "Sonstiges",
    });
  };
  
  const handleDelete = async (eventId: string) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/calendar?id=${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Termins.');
        }
        toast({ title: "Erfolg", description: "Termin wurde gelöscht." });
        fetchEvents(); // Refresh list
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  async function onSubmit(data: EventFormValues) {
    if (!user || !isAdmin) return;

    const startDateTime = new Date(`${data.startDate}T${data.allDay ? '00:00:00' : data.startTime}`).toISOString();
    const endDateTime = new Date(`${data.endDate}T${data.allDay ? '23:59:59' : data.endTime}`).toISOString();

    const payload = {
        title: data.title,
        start: startDateTime,
        end: endDateTime,
        allDay: data.allDay,
        location: data.location,
        description: data.description,
        category: data.category,
    };
    
    const idToken = await user.getIdToken();
    const isUpdating = !!editingEvent;
    const url = isUpdating ? `/api/admin/calendar?id=${editingEvent.id}` : '/api/admin/calendar';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');

      toast({ title: "Erfolg!", description: `Termin wurde ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchEvents(); // Refresh list
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }
  
  const isSubmitDisabled = authLoading || !user || !isAdmin || form.formState.isSubmitting;
  const allDay = form.watch("allDay");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title="Kalender Verwalten" subtitle="Vereinstermine erstellen, bearbeiten und löschen." className="mb-0 pb-0 border-none flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarPlus className="mr-2 h-5 w-5 text-primary"/>{editingEvent ? 'Termin Bearbeiten' : 'Neuen Termin Erstellen'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titel*</FormLabel><FormControl><Input placeholder="z.B. Monatliches Vereinstreffen" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start-Datum*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  {!allDay && <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start-Uhrzeit*</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                  <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End-Datum*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  {!allDay && <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>End-Uhrzeit*</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />}
              </div>

              <FormField control={form.control} name="allDay" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Ganztägiger Termin</FormLabel></div></FormItem>)} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Ort (Optional)</FormLabel><FormControl><Input placeholder="z.B. Vereinsheim" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Kategorie auswählen" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {eventCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Beschreibung (Optional)</FormLabel><FormControl><Textarea placeholder="Weitere Details zum Termin..." {...field} rows={5}/></FormControl><FormMessage /></FormItem>)} />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitDisabled}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingEvent ? <Edit className="mr-2 h-4 w-4" /> : <CalendarPlus className="mr-2 h-4 w-4" />)}
                    {editingEvent ? 'Termin Aktualisieren' : 'Termin Speichern'}
                </Button>
                {editingEvent && (<Button type="button" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>)}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><List className="mr-2"/>Aktuelle & Zukünftige Termine</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Termine...</span></div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">Keine Termine gefunden.</p>
          ) : (
            <div className="space-y-4">
              {events.filter(event => new Date(event.end) >= new Date()).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                     <div>
                        <p className="font-semibold">{event.title} <span className="text-xs font-normal text-muted-foreground">({event.category})</span></p>
                        <p className="text-sm text-muted-foreground">
                            {format(parseISO(event.start), 'dd.MM.yyyy HH:mm')} - {format(parseISO(event.end), 'dd.MM.yyyy HH:mm')}
                        </p>
                     </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(event)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle><AlertDialogDescription>Der Termin "{event.title}" wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>Löschen</AlertDialogAction>
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
