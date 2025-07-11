
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { de } from 'date-fns/locale';
import { format, startOfDay, isSameDay } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, CalendarDays } from 'lucide-react';
import type { CalendarEvent, EventCategory } from '@/types';

// Helper to get color based on category
const getCategoryClass = (category: EventCategory): string => {
  switch (category) {
    case 'Rennen': return 'bg-red-500 text-white';
    case 'Training': return 'bg-blue-500 text-white';
    case 'Sitzung': return 'bg-yellow-500 text-black';
    case 'Feier': return 'bg-green-500 text-white';
    case 'Arbeitseinsatz': return 'bg-gray-500 text-white';
    default: return 'bg-primary text-primary-foreground';
  }
};

export default function KalenderPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/calendar'); // Using the admin route is fine for public read
        if (!res.ok) throw new Error('Termine konnten nicht geladen werden');
        const data: CalendarEvent[] = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Fehler beim Laden der Termine:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventDays = useMemo(() => {
    return events.map(event => startOfDay(new Date(event.start)));
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter(event => isSameDay(new Date(event.start), selectedDay)).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, selectedDay]);

  const formatEventTime = (event: CalendarEvent): string => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    if (event.allDay) return "Ganztägig";
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')} Uhr`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vereinskalender"
        subtitle="Alle anstehenden Termine, Trainings und Veranstaltungen auf einen Blick."
      />
      
      <Card className="shadow-lg">
        <CardContent className="p-2 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Lade Kalender...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex justify-center">
                 <DayPicker
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    locale={de}
                    showOutsideDays
                    fixedWeeks
                    className="p-3 bg-card rounded-md border"
                    modifiers={{
                        hasEvent: eventDays,
                    }}
                    modifiersClassNames={{
                        hasEvent: 'relative !bg-primary/20 rounded-md',
                    }}
                    footer={selectedDay && <p className="text-sm text-center pt-2">Ausgewählt: {format(selectedDay, 'PPP', { locale: de })}</p>}
                  />
              </div>

              <div className="md:col-span-1 space-y-4">
                 <CardHeader className="p-2">
                   <CardTitle className="flex items-center">
                     <CalendarDays className="h-6 w-6 mr-2 text-primary-foreground-alt"/>
                     Termine für {selectedDay ? format(selectedDay, 'd. MMMM', { locale: de }) : '...'}
                   </CardTitle>
                   <CardDescription>
                     Wählen Sie einen Tag im Kalender aus.
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4 p-2 max-h-[500px] overflow-y-auto">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(event => (
                            <div key={event.id} className="p-4 border rounded-lg bg-secondary/50">
                                <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Clock className="h-4 w-4 mr-2"/>
                                    {formatEventTime(event)}
                                </div>
                                {event.location && (
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <MapPin className="h-4 w-4 mr-2"/>
                                        {event.location}
                                    </div>
                                )}
                                <Badge className={`mt-2 ${getCategoryClass(event.category)}`}>{event.category}</Badge>
                                {event.description && <p className="text-sm mt-2">{event.description}</p>}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center p-6">Für diesen Tag sind keine Termine eingetragen.</p>
                    )}
                 </CardContent>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
