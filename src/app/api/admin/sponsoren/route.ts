
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';
import type { Sponsor } from '@/types';

export const config = { api: { bodyParser: false } };

async function uploadSponsorLogoToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) throw new Error('Admin SDK not initialized.');
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Storage bucket name not configured.');
  
  const bucket = adminApp.storage().bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `sponsors_logos/${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  await blob.save(fileBuffer, { metadata: { contentType: file.type }, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
}

// GET all sponsors
export async function GET(req: NextRequest) {
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    try {
        const sponsorsCollectionRef = adminApp.firestore().collection("sponsors").orderBy("displayOrder", "asc").orderBy("name", "asc");
        const querySnapshot = await sponsorsCollectionRef.get();
        const sponsors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sponsor[];
        return NextResponse.json(sponsors, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching sponsors', error: error.message }, { status: 500 });
    }
}

async function handleRequest(req: NextRequest, isUpdate: boolean) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const formData = await req.formData();
        const sponsorId = formData.get('id') as string;
        if (!sponsorId) return NextResponse.json({ message: 'Sponsor ID is required' }, { status: 400 });

        const sponsorRef = adminApp.firestore().collection("sponsors").doc(sponsorId);

        const sponsorData: any = {
            name: formData.get('name') as string,
            level: formData.get('level') as string,
            websiteUrl: (formData.get('websiteUrl') as string) || '',
            dataAiHint: (formData.get('dataAiHint') as string) || '',
            displayOrder: Number(formData.get('displayOrder') as string) || 99,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        if (!isUpdate) {
            sponsorData.createdAt = admin.firestore.FieldValue.serverTimestamp();
            sponsorData.isActive = true;
        }

        const logoFile = formData.get('logoFile') as File | null;
        if (logoFile) {
            sponsorData.logoUrl = await uploadSponsorLogoToFirebaseAdmin(logoFile);
        } else if (!isUpdate) {
            return NextResponse.json({ message: 'Logo file is required for new sponsors' }, { status: 400 });
        }
        
        await sponsorRef.set(sponsorData, { merge: isUpdate });

        return NextResponse.json({
            message: `Sponsor ${isUpdate ? 'updated' : 'created'} successfully`,
            id: sponsorId,
        }, { status: isUpdate ? 200 : 201 });

    } catch (error: any) {
        return NextResponse.json({ message: `Error ${isUpdate ? 'updating' : 'creating'} sponsor`, error: error.message }, { status: 500 });
    }
}


// POST a new sponsor
export async function POST(req: NextRequest) {
    return handleRequest(req, false);
}

// PUT (update) a sponsor
export async function PUT(req: NextRequest) {
    return handleRequest(req, true);
}


// DELETE a sponsor
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const sponsorId = req.nextUrl.searchParams.get('id');
    if (!sponsorId) return NextResponse.json({ message: 'Sponsor ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        await adminApp.firestore().collection("sponsors").doc(sponsorId).delete();
        return NextResponse.json({ message: 'Sponsor deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting sponsor', error: error.message }, { status: 500 });
    }
}
