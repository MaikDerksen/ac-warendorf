
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import type { KontaktPageContent } from '@/types';

export async function GET(req: NextRequest) {
  if (!adminApp) return NextResponse.json({ message: 'Admin SDK not available.' }, { status: 500 });
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("kontaktPage");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() as KontaktPageContent, { status: 200 });
    }
    return NextResponse.json({}, { status: 200 }); // Return empty if not set
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
  const contentToUpdate: Partial<KontaktPageContent> & { updatedAt?: any, updatedBy?: string } = {};

  try {
    const formData = await req.formData();
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        (contentToUpdate as any)[key] = value;
      }
    }
    
    if (Object.keys(contentToUpdate).length === 0) {
        return NextResponse.json({ message: 'No content provided to update.' }, { status: 400 });
    }

    contentToUpdate.updatedAt = FieldValue.serverTimestamp();
    contentToUpdate.updatedBy = adminCheck.uid;
    
    const docRef = firestoreDb.collection("siteContent").doc("kontaktPage");
    await docRef.set(contentToUpdate, { merge: true });

    return NextResponse.json({ 
        message: "'Kontakt' page content updated successfully."
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating 'Kontakt' page content:", error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message }, { status: 500 });
  }
}

    