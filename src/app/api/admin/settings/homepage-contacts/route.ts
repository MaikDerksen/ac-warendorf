
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';

// GET current homepage contact persons
export async function GET(req: NextRequest) {
  // Optional: Add admin verification if only admins should see this,
  // but typically site settings might be fetched by admin panel components before update.
  // const adminCheck = await verifyAdmin(req);
  // if (!adminCheck.isAdmin) {
  //   return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  // }

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for homepage contacts GET.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return NextResponse.json({ contactPersonIds: data?.contactPersonIds || [] }, { status: 200 });
    } else {
      return NextResponse.json({ contactPersonIds: [] }, { status: 200 }); // Return empty if not set
    }
  } catch (error: any) {
    console.error("Error fetching homepage contacts from Firestore:", error);
    return NextResponse.json({ message: 'Error fetching settings.', error: error.message || String(error) }, { status: 500 });
  }
}


// POST to update homepage contact persons
export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is updating homepage contact persons.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for homepage contacts POST.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const { contactPersonIds } = await req.json();

    if (!Array.isArray(contactPersonIds)) {
      return NextResponse.json({ message: 'Invalid data format: contactPersonIds must be an array.' }, { status: 400 });
    }
    if (contactPersonIds.length > 4) {
      return NextResponse.json({ message: 'Cannot select more than 4 contact persons.' }, { status: 400 });
    }
    // Further validation could ensure IDs are valid board member IDs if needed

    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    
    await settingsDocRef.set({
      contactPersonIds: contactPersonIds,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminCheck.uid,
    }, { merge: true });

    return NextResponse.json({ message: 'Homepage contact persons updated successfully.', contactPersonIds }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating homepage contact persons:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
