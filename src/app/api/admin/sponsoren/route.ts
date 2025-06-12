
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';

export const config = {
  api: {
    bodyParser: false, // Required for FormData
  },
};

async function uploadSponsorLogoToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) {
    throw new Error('Admin SDK not initialized for file upload.');
  }
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket name not configured in environment variables.');
  }
  const bucket = adminApp.storage().bucket(bucketName);
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  // Sanitize filename for URL safety and to prevent path traversal
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `sponsors_logos/${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || 'application/octet-stream', // Provide a default MIME type
    },
    public: true, // Make the file publicly readable
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error("Firebase Admin Storage upload error (Sponsors):", err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log('Sponsor logo file available at', publicUrl);
      resolve(publicUrl);
    });
    blobStream.end(fileBuffer);
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is creating/updating a sponsor.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for sponsors.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    
    const id = formData.get('id') as string; // Used for a unique Firestore doc ID based on sponsor, not for update logic yet
    const name = formData.get('name') as string;
    const level = formData.get('level') as string;
    const websiteUrl = formData.get('websiteUrl') as string | undefined;
    const dataAiHint = formData.get('dataAiHint') as string | undefined;
    const logoFile = formData.get('logoFile') as File | null;

    if (!id || !name || !level) {
        return NextResponse.json({ message: 'Missing required fields: id, name, or level.' }, { status: 400 });
    }

    if (!logoFile || logoFile.size === 0) {
        return NextResponse.json({ message: 'Logo file is required.' }, { status: 400 });
    }

    const newSponsorData: any = {
      // id is used as document id, not stored in fields
      name: name,
      level: level,
      websiteUrl: websiteUrl || '',
      dataAiHint: dataAiHint || '',
      logoUrl: '', // Will be updated after upload
      isActive: true, // Default to active
      displayOrder: 0, // Default display order
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: adminCheck.uid,
    };

    let uploadedLogoUrl: string | null = null;

    try {
      uploadedLogoUrl = await uploadSponsorLogoToFirebaseAdmin(logoFile);
      newSponsorData.logoUrl = uploadedLogoUrl;
    } catch (uploadError: any) {
      console.error('Sponsor logo upload to Firebase Storage failed:', uploadError);
      return NextResponse.json({
        message: 'Error uploading sponsor logo to Firebase Storage.',
        error: uploadError.message || String(uploadError)
      }, { status: 500 });
    }
    
    // Use the provided 'id' (e.g., 'sponsor_firmenname') as the Firestore document ID
    // This makes it easier to reference/update if needed, assuming 'id' is unique.
    const sponsorDocRef = firestoreDb.collection("sponsors").doc(id);
    
    try {
      await sponsorDocRef.set(newSponsorData); // Using .set() with a specific doc ID
      return NextResponse.json({
        message: `Sponsor data processed and saved to Firestore with ID: ${id}. Logo uploaded.`,
        firestoreId: id,
        logoUrl: newSponsorData.logoUrl,
      }, { status: 200 });

    } catch (firestoreError: any) {
      console.error('Error saving sponsor document to Firestore:', firestoreError);
      // Rollback image upload if Firestore save fails
      if (uploadedLogoUrl) {
        try {
           const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
           if (bucketName) {
            const objectPath = new URL(uploadedLogoUrl).pathname.substring(1).split('/').slice(1).join('/'); //  e.g. sponsors_logos/123.jpg
            await adminApp.storage().bucket(bucketName).file(objectPath).delete();
            console.log(`Rolled back: Deleted sponsor logo ${objectPath} from Firebase Storage due to Firestore error.`);
           }
        } catch (deleteError) {
          console.error(`Error deleting sponsor logo from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving sponsor data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing sponsor submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  // Optional: Add admin verification if this endpoint should be protected
  // const adminCheck = await verifyAdmin(req);
  // if (!adminCheck.isAdmin) {
  //   return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  // }

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for fetching sponsors.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const sponsorsCollectionRef = collection(firestoreDb, "sponsors");
    // You might want to order them, e.g., by displayOrder or name
    const q = query(sponsorsCollectionRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    
    const sponsors: any[] = [];
    querySnapshot.forEach((doc) => {
      sponsors.push({
        id: doc.id, // The document ID
        ...doc.data(),
      });
    });
    
    return NextResponse.json(sponsors, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching sponsors from Firestore:", error);
    return NextResponse.json({ message: 'Error fetching sponsors.', error: error.message || String(error) }, { status: 500 });
  }
}
