
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus, Trash2, Edit, Loader2, List, CalendarIcon, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import type { CalendarEvent, EventCategory } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const eventCategories: EventCategory[] = ['Training', 'Rennen', 'Sitzung', 'Feier', 'Arbeitseinsatz', 'Sonstiges'];
const weekdays = [{id: 'monday', label: 'Mo'}, {id: 'tuesday', label: 'Di'}, {id: 'wednesday', label: 'Mi'}, {id: 'thursday', label: 'Do'}, {id: 'friday', label: 'Fr'}, {id: 'saturday', label: 'Sa'}, {id: 'sunday', label: 'So'}];

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
  recurring: z.boolean().default(false),
  recurrence: z.object({
    frequency: z.enum(['weekly']).optional(),
    endDate: z.string().optional(),
    days: z.array(z.string()).optional(),
  }).optional(),
}).refine(data => {
    if (data.recurring && data.recurrence?.endDate) {
        const start = new Date(data.startDate);
        const recurrenceEnd = new Date(data.recurrence.endDate);
        return recurrenceEnd >= start;
    }
    return true;
}, {
    message: "Das End-Datum der Wiederholung muss nach dem Start-Datum liegen.",
    path: ["recurrence.endDate"],
}).refine(data => {
    if (!data.recurring) {
        const startDateTime = new Date(`${data.startDate}T${data.allDay ? '00:00' : data.startTime}`);
        const endDateTime = new Date(`${data.endDate}T${data.allDay ? '23:59' : data.endTime}`);
        return endDateTime >= startDateTime;
    }
    if (data.recurring && !data.allDay) {
        const start = new Date(`1970-01-01T${data.startTime}`);
        const end = new Date(`1970-01-01T${data.endTime}`);
        return end > start;
    }
    return true;
}, {
    message: "Das Enddatum/-zeit muss nach dem Startdatum/-zeit liegen.",
    path: ["endDate"],
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
        endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
        location: "", 
        description: "", 
        category: "Training",
        recurring: false,
        recurrence: {
            frequency: 'weekly',
            endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd'),
            days: []
        }
    },
  });
  
  const { isSubmitting } = form.formState;

  const fetchEvents = async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/calendar');
      if (!response.ok) throw new Error('Termine konnten nicht geladen werden.');
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
      setEvents([]); // Clear events on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
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
      recurring: !!event.recurrenceGroupId,
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
        category: "Training",
        recurring: false,
        recurrence: {
            frequency: 'weekly',
            endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd'),
            days: []
        }
    });
  };
  
  const handleDelete = async (eventId: string, recurrenceGroupId?: string, deleteAllFuture?: boolean) => {
    if (!isAdmin || !user) return;
    try {
        const idToken = await user.getIdToken();
        let url = `/api/admin/calendar?id=${eventId}`;
        if (recurrenceGroupId && deleteAllFuture) {
          url += `&recurrenceGroupId=${recurrenceGroupId}&deleteAllFuture=true`;
        }

        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Löschen des Termins.');
        }
        toast({ title: "Erfolg", description: "Termin(e) wurde(n) gelöscht." });
        fetchEvents();
    } catch (error: any) {
        toast({ title: "Löschfehler", description: error.message, variant: "destructive" });
    }
  };

  const allDay = form.watch("allDay");
  const isRecurring = form.watch("recurring");

  async function onSubmit(data: EventFormValues) {
    if (!user || !isAdmin) return;
    
    const startDateTime = new Date(`${data.startDate}T${data.allDay ? '00:00:00' : data.startTime}`).toISOString();
    
    const finalEndDate = data.recurring ? data.startDate : data.endDate;
    const endDateTime = new Date(`${finalEndDate}T${data.allDay ? '23:59:59' : data.endTime}`).toISOString();
    
    const payload: any = {
        title: data.title,
        start: startDateTime,
        end: endDateTime,
        allDay: data.allDay,
        location: data.location,
        description: data.description,
        category: data.category,
    };
    
    if (data.recurring && !editingEvent) {
      if (!data.recurrence?.days || data.recurrence.days.length === 0) {
        toast({ title: "Validierungsfehler", description: "Bitte wählen Sie mindestens einen Wochentag für wiederkehrende Termine.", variant: "destructive" });
        return;
      }
      payload.recurrence = data.recurrence;
    }

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

      toast({ title: "Erfolg!", description: `Termin(e) wurde(n) ${isUpdating ? 'aktualisiert' : 'erstellt'}.` });
      handleCancelEdit();
      fetchEvents(); 
    } catch (error: any) {
      toast({ title: "Speicherfehler", description: error.message, variant: "destructive" });
    }
  }

  const renderEventList = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Lade Termine...</span></div>;
    }
    if (events.length === 0) {
      return <p className="text-muted-foreground">Keine Termine gefunden.</p>;
    }
    const upcomingEvents = events
      .filter(event => event.end && isValid(new Date(event.end)) && new Date(event.end) >= new Date())
      .sort((a,b) => (a.start && b.start) ? new Date(a.start).getTime() - new Date(b.start).getTime() : 0);

    return (
      <div className="space-y-4">
        {upcomingEvents.map(event => {
            const start = event.start ? parseISO(event.start) : null;
            const end = event.end ? parseISO(event.end) : null;
            if (!start || !end || !isValid(start) || !isValid(end)) {
                console.warn(`Skipping invalid event:`, event);
                return null;
            }
            return (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{event.title} <span className="text-xs font-normal text-muted-foreground">({event.category})</span> {event.recurrenceGroupId && <Repeat className="inline h-3 w-3 text-muted-foreground"/>}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(start, 'dd.MM.yyyy HH:mm')} - {format(end, 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEditClick(event)}><Edit className="h-4 w-4"/><span className="sr-only">Bearbeiten</span></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /><span className="sr-only">Löschen</span></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {event.recurrenceGroupId ? `Dies ist ein wiederkehrender Termin. Was möchten Sie löschen?` : `Der Termin "${event.title}" wird dauerhaft gelöscht.`}
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={event.recurrenceGroupId ? 'grid grid-cols-1 md:grid-cols-3 gap-2' : ''}>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id, undefined, false)}>
                            {event.recurrenceGroupId ? "Nur diesen einen Termin löschen" : "Löschen"}
                          </AlertDialogAction>
                          {event.recurrenceGroupId && (
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90 md:col-span-2"
                              onClick={() => handleDelete(event.id, event.recurrenceGroupId, true)}>
                                Diesen und alle zukünftigen Termine löschen
                            </AlertDialogAction>
                          )}
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )})}
      </div>
    )
  }

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
                  
                  { !isRecurring && !editingEvent &&
                    <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End-Datum*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  }
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
              
              {!editingEvent && (
                <>
                <Separator />
                 <Card className="bg-muted/50">
                    <CardHeader className="p-4">
                      <FormField control={form.control} name="recurring" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="flex items-center text-lg"><Repeat className="mr-2 h-5 w-5"/>Wiederkehrender Termin</FormLabel></FormItem>)} />
                    </CardHeader>
                    {isRecurring && (
                        <CardContent className="space-y-4 p-4 pt-0">
                             <FormField control={form.control} name="recurrence.endDate" render={({ field }) => (<FormItem><FormLabel>Wiederholen bis einschließlich*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="recurrence.frequency" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequenz</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Frequenz wählen" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </FormItem>
                            )}/>
                            
                            <Controller
                                control={form.control}
                                name="recurrence.days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>An Wochentagen</FormLabel>
                                        <div className="flex flex-wrap gap-2 rounded-lg border p-2">
                                            {weekdays.map(day => (
                                                <Button
                                                    key={day.id}
                                                    type="button"
                                                    variant={(field.value || []).includes(day.id) ? "default" : "outline"}
                                                    onClick={() => {
                                                        const currentDays = field.value || [];
                                                        const newDays = currentDays.includes(day.id)
                                                            ? currentDays.filter(d => d !== day.id)
                                                            : [...currentDays, day.id];
                                                        field.onChange(newDays);
                                                    }}
                                                >
                                                    {day.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    )}
                 </Card>
                </>
              )}


              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingEvent ? <Edit className="mr-2 h-4 w-4" /> : <CalendarPlus className="mr-2 h-4 w-4" />)}
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
          {renderEventList()}
        </CardContent>
      </Card>
    </div>
  );
}

    
