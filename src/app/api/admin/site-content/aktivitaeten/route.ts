
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import type { AktivitaetenPageContent } from '@/types';

async function uploadSiteContentImage(file: File, pathPrefix: string): Promise<string> {
  if (!adminApp) throw new Error('Admin SDK not initialized.');
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Storage bucket name not configured.');
  
  const bucket = adminApp.storage().bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `${pathPrefix}${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  await blob.save(fileBuffer, {
    metadata: { contentType: file.type || 'application/octet-stream', public: true },
    public: true,
  });
  return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
}

export async function GET(req: NextRequest) {
  if (!adminApp) return NextResponse.json({ message: 'Admin SDK not available.' }, { status: 500 });
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("aktivitaeten");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() as AktivitaetenPageContent, { status: 200 });
    }
    return NextResponse.json({}, { status: 200 }); // Return empty if not set, defaults handled client-side
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching content.', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  if (!adminApp) return NextResponse.json({ message: 'Admin SDK not available.' }, { status: 500 });
  
  const firestoreDb = adminApp.firestore();
  const contentToUpdate: Partial<AktivitaetenPageContent> & { updatedAt?: any, updatedBy?: string } = {};

  try {
    const formData = await req.formData();
    
    // Handle text fields
    for (const [key, value] of formData.entries()) {
      if (key === 'mainImageFile') continue; // Skip file, handle separately
      if (key === 'futurePossibilitiesItems' && typeof value === 'string') {
        try {
            contentToUpdate.futurePossibilitiesItems = JSON.parse(value);
        } catch (e) {
            console.warn("Could not parse futurePossibilitiesItems JSON:", value);
            // If parsing fails, maybe store as is or split by newline as fallback
            contentToUpdate.futurePossibilitiesItems = value.split('\n').map(s => s.trim()).filter(s => s);
        }
      } else if (typeof value === 'string') {
        (contentToUpdate as any)[key] = value;
      }
    }

    const mainImageFile = formData.get('mainImageFile') as File | null;
    let newMainImageUrl: string | undefined = undefined;

    if (mainImageFile && mainImageFile.size > 0) {
      try {
        newMainImageUrl = await uploadSiteContentImage(mainImageFile, 'general/aktivitaeten_page/');
        contentToUpdate.mainImageUrl = newMainImageUrl;
      } catch (uploadError: any) {
        return NextResponse.json({ message: 'Error uploading main image.', error: uploadError.message }, { status: 500 });
      }
    }
    
    if (Object.keys(contentToUpdate).length === 0 && !newMainImageUrl) {
        return NextResponse.json({ message: 'No content provided to update.' }, { status: 400 });
    }

    contentToUpdate.updatedAt = FieldValue.serverTimestamp();
    contentToUpdate.updatedBy = adminCheck.uid;
    
    const docRef = firestoreDb.collection("siteContent").doc("aktivitaeten");
    await docRef.set(contentToUpdate, { merge: true });

    return NextResponse.json({ 
        message: 'Aktivitäten page content updated successfully.',
        updatedFields: {
            ...(newMainImageUrl && { mainImageUrl: newMainImageUrl })
        }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating Aktivitäten page content:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message }, { status: 500 });
  }
}

    