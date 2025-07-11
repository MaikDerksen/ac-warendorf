
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import type { CalendarEvent, EventCategory } from '@/types';
import { add, nextDay, isBefore, isSameDay, Day, parseISO } from 'date-fns';

export const config = { api: { bodyParser: true } };

const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    start: z.string().datetime("Invalid start date-time format."),
    end: z.string().datetime("Invalid end date-time format."),
    allDay: z.boolean(),
    location: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['Training', 'Rennen', 'Sitzung', 'Feier', 'Arbeitseinsatz', 'Sonstiges']),
});

const dayMap: { [key: string]: Day } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function findFirstOccurrence(startDate: Date, desiredDay: Day): Date {
    const startDay = startDate.getDay() as Day;
    if (startDay === desiredDay) {
        return startDate;
    }
    return nextDay(startDate, desiredDay);
}


async function createRecurringEvents(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, rawData: any, adminUid: string) {
    const { title, start, end, allDay, location, description, category, recurrence } = rawData;
    
    if (!recurrence.days || recurrence.days.length === 0) {
        throw new Error("Recurring event must have at least one day selected.");
    }
    
    const recurrenceGroupId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const recurrenceEndDate = parseISO(recurrence.endDate);
    
    const originalStartDate = parseISO(start);
    const originalEndDate = parseISO(end);
    const duration = originalEndDate.getTime() - originalStartDate.getTime();
    
    const recurrenceDays: Day[] = recurrence.days.map((day: string) => dayMap[day]);

    for (const day of recurrenceDays) {
        let currentDate = findFirstOccurrence(originalStartDate, day);

        while (isBefore(currentDate, recurrenceEndDate) || isSameDay(currentDate, recurrenceEndDate)) {
            const newStart = currentDate;
            const newEnd = new Date(newStart.getTime() + duration);
            
            const newEventData = {
                title, allDay, location, description, category,
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
                createdAt: FieldValue.serverTimestamp(),
                createdBy: adminUid,
                recurrenceGroupId, 
            };
            const docRef = firestore.collection("calendarEvents").doc();
            batch.set(docRef, newEventData);

            currentDate = add(currentDate, { weeks: 1 });
        }
    }
}

export async function GET(req: NextRequest) {
  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  try {
    const eventsCollectionRef = adminApp.firestore().collection("calendarEvents").orderBy("start", "asc");
    const querySnapshot = await eventsCollectionRef.get();
    const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching events', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  const firestoreDb = adminApp.firestore();
  
  try {
    const rawData = await req.json();

    if (rawData.recurrence) {
        const batch = firestoreDb.batch();
        await createRecurringEvents(batch, firestoreDb, rawData, adminCheck.uid);
        await batch.commit();
        return NextResponse.json({ message: "Recurring events created successfully" }, { status: 201 });
    } else {
        const validation = eventSchema.safeParse(rawData);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid event data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const newEventData = {
            ...validation.data,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: adminCheck.uid,
        };

        const docRef = await firestoreDb.collection("calendarEvents").add(newEventData);
        return NextResponse.json({ message: `Event created with ID: ${docRef.id}`, id: docRef.id }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ message: 'Error creating event', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const eventId = req.nextUrl.searchParams.get('id');
    if (!eventId) return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const rawData = await req.json();
        const validation = eventSchema.safeParse(rawData);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid event data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const eventRef = adminApp.firestore().collection("calendarEvents").doc(eventId);
        const eventToUpdate = {
            ...validation.data,
            updatedAt: FieldValue.serverTimestamp(),
        };

        await eventRef.update(eventToUpdate);
        return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating event:", error);
        return NextResponse.json({ message: 'Error updating event', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const eventId = req.nextUrl.searchParams.get('id');
    if (!eventId) return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    
    const recurrenceGroupId = req.nextUrl.searchParams.get('recurrenceGroupId');
    const deleteAllFuture = req.nextUrl.searchParams.get('deleteAllFuture') === 'true';

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    const firestoreDb = adminApp.firestore();

    try {
        if (deleteAllFuture && recurrenceGroupId) {
            const eventToDeleteSnapshot = await firestoreDb.collection("calendarEvents").doc(eventId).get();
            if (!eventToDeleteSnapshot.exists) {
                throw new Error("The starting event for deletion could not be found.");
            }
            const eventData = eventToDeleteSnapshot.data();
            if (!eventData || !eventData.start || typeof eventData.start !== 'string') {
                throw new Error("The starting event's data is incomplete or has an invalid start date.");
            }
            
            const eventStartDateISO = eventData.start;

            const q = firestoreDb.collection("calendarEvents")
                                .where('recurrenceGroupId', '==', recurrenceGroupId)
                                .where('start', '>=', eventStartDateISO);

            const snapshot = await q.get();
            if (snapshot.empty) {
                await firestoreDb.collection("calendarEvents").doc(eventId).delete();
                return NextResponse.json({ message: `Deleted 1 final event.` }, { status: 200 });
            }
            
            const batch = firestoreDb.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            return NextResponse.json({ message: `Deleted ${snapshot.size} recurring events.` }, { status: 200 });

        } else {
            await firestoreDb.collection("calendarEvents").doc(eventId).delete();
            return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
        }
    } catch (error: any) {
        console.error("Error deleting event(s):", error);
        return NextResponse.json({ message: 'Error deleting event(s)', error: error.message }, { status: 500 });
    }
}

    