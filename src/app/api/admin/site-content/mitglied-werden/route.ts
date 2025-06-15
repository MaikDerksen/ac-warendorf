
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import type { MitgliedWerdenPageContent, FaqItem } from '@/types';

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
    const docRef = firestoreDb.collection("siteContent").doc("mitgliedWerden");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() as MitgliedWerdenPageContent, { status: 200 });
    }
    // Return default structure or empty object if you want client to handle defaults
    return NextResponse.json({ faqItems: [] }, { status: 200 }); 
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
  const contentToUpdate: Partial<MitgliedWerdenPageContent> & { updatedAt?: any, updatedBy?: string } = {};

  try {
    const formData = await req.formData();
    
    for (const [key, value] of formData.entries()) {
      if (key === 'imageFile') continue; 
      if (key === 'faqItems' && typeof value === 'string') {
        try {
          const parsedFaqs = JSON.parse(value);
          if (Array.isArray(parsedFaqs)) {
            contentToUpdate.faqItems = parsedFaqs.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(7),
              question: item.question || '',
              answer: item.answer || '',
              category: item.category || undefined,
              displayOrder: Number(item.displayOrder) || 0,
              icon: item.icon || 'HelpCircle',
            }));
          } else {
            throw new Error("Parsed FAQs is not an array");
          }
        } catch (e: any) {
          console.error("Error parsing FAQ items JSON:", e.message);
          // Potentially return error or save other fields and skip FAQs
          return NextResponse.json({ message: `Error parsing FAQ items: ${e.message}. Other fields not saved.` }, { status: 400 });
        }
      } else if (typeof value === 'string') {
        (contentToUpdate as any)[key] = value;
      }
    }

    const imageFile = formData.get('imageFile') as File | null;
    let newImageUrl: string | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      try {
        newImageUrl = await uploadSiteContentImage(imageFile, 'general/mitglied_werden_page/');
        contentToUpdate.imageUrl = newImageUrl;
      } catch (uploadError: any) {
        return NextResponse.json({ message: 'Error uploading image.', error: uploadError.message }, { status: 500 });
      }
    }
    
    if (Object.keys(contentToUpdate).length === 0 && !newImageUrl) {
        return NextResponse.json({ message: 'No content provided to update.' }, { status: 400 });
    }

    contentToUpdate.updatedAt = FieldValue.serverTimestamp();
    contentToUpdate.updatedBy = adminCheck.uid;
    
    const docRef = firestoreDb.collection("siteContent").doc("mitgliedWerden");
    await docRef.set(contentToUpdate, { merge: true });

    return NextResponse.json({ 
        message: "'Mitglied Werden' page content updated successfully.",
        updatedFields: {
            ...(newImageUrl && { imageUrl: newImageUrl })
        }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating 'Mitglied Werden' page content:", error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message }, { status: 500 });
  }
}

    