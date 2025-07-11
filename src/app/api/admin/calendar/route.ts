
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import type { CalendarEvent, EventCategory } from '@/types';

export const config = { api: { bodyParser: true } };

// Zod schema for event validation
const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    start: z.string().datetime("Invalid start date-time format."),
    end: z.string().datetime("Invalid end date-time format."),
    allDay: z.boolean(),
    location: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['Training', 'Rennen', 'Sitzung', 'Feier', 'Arbeitseinsatz', 'Sonstiges']),
});

// GET all calendar events
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

// POST a new calendar event
export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  
  try {
    const rawData = await req.json();
    const validation = eventSchema.safeParse(rawData);
    if (!validation.success) {
        return NextResponse.json({ message: "Invalid event data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newEventData = {
        ...validation.data,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: adminCheck.uid,
    };

    const docRef = await adminApp.firestore().collection("calendarEvents").add(newEventData);
    return NextResponse.json({ message: `Event created with ID: ${docRef.id}`, id: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ message: 'Error creating event', error: error.message }, { status: 500 });
  }
}

// PUT (update) a calendar event
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

// DELETE a calendar event
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const eventId = req.nextUrl.searchParams.get('id');
    if (!eventId) return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        await adminApp.firestore().collection("calendarEvents").doc(eventId).delete();
        return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting event', error: error.message }, { status: 500 });
    }
}
