
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';
import type { Pilot } from '@/types';

export const config = { api: { bodyParser: false } };

async function uploadPilotImageToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) throw new Error('Admin SDK not initialized.');
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Storage bucket name not configured.');
  
  const bucket = adminApp.storage().bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `pilots/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  await blob.save(fileBuffer, { metadata: { contentType: file.type }, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
}

// GET all pilots
export async function GET(req: NextRequest) {
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    try {
        const pilotsCollectionRef = adminApp.firestore().collection("pilots").orderBy("name", "asc");
        const querySnapshot = await pilotsCollectionRef.get();
        const pilots = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pilot[];
        return NextResponse.json(pilots, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching pilots', error: error.message }, { status: 500 });
    }
}

// POST a new pilot
export async function POST(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const formData = await req.formData();
        const newPilotData: any = {
            name: formData.get('name') as string,
            profileSlug: (formData.get('profileSlug') as string) || '',
            bio: (formData.get('bio') as string) || '',
            achievements: (formData.get('achievements') as string || '').split('|').map(a => a.trim()).filter(a => a),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: adminCheck.uid,
        };

        const imageFile = formData.get('imageFile') as File | null;
        if (imageFile) {
            newPilotData.imageUrl = await uploadPilotImageToFirebaseAdmin(imageFile);
        }

        const docRef = await adminApp.firestore().collection("pilots").add(newPilotData);
        return NextResponse.json({ message: `Pilot created with ID: ${docRef.id}`, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error creating pilot', error: error.message }, { status: 500 });
    }
}


// PUT (update) a pilot
export async function PUT(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const pilotId = req.nextUrl.searchParams.get('id');
    if (!pilotId) return NextResponse.json({ message: 'Pilot ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const formData = await req.formData();
        const pilotRef = adminApp.firestore().collection("pilots").doc(pilotId);

        const pilotToUpdate: any = {
            name: formData.get('name') as string,
            profileSlug: (formData.get('profileSlug') as string) || '',
            bio: (formData.get('bio') as string) || '',
            achievements: (formData.get('achievements') as string || '').split('|').map(a => a.trim()).filter(a => a),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const imageFile = formData.get('imageFile') as File | null;
        if (imageFile) {
            pilotToUpdate.imageUrl = await uploadPilotImageToFirebaseAdmin(imageFile);
        }

        await pilotRef.update(pilotToUpdate);
        return NextResponse.json({ message: 'Pilot updated successfully' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating pilot', error: error.message }, { status: 500 });
    }
}


// DELETE a pilot
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const pilotId = req.nextUrl.searchParams.get('id');
    if (!pilotId) return NextResponse.json({ message: 'Pilot ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        await adminApp.firestore().collection("pilots").doc(pilotId).delete();
        return NextResponse.json({ message: 'Pilot deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting pilot', error: error.message }, { status: 500 });
    }
}
