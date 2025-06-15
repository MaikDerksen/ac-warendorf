
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';

export const config = {
  api: {
    bodyParser: false, 
  },
};

async function uploadBoardMemberImageToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) {
    throw new Error('Admin SDK not initialized for file upload.');
  }
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket name not configured in environment variables.');
  }
  const bucket = adminApp.storage().bucket(bucketName);
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `vorstand_images/${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || 'application/octet-stream',
    },
    public: true,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error("Firebase Admin Storage upload error (Board Members):", err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
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
  console.log(`Admin user ${adminCheck.uid} is creating/updating a board member.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for board members.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    
    const id = formData.get('id') as string; 
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const term = formData.get('term') as string | undefined;
    const slug = formData.get('slug') as string | undefined; 
    const description = formData.get('description') as string | undefined;
    // 'order' is no longer taken from form data
    const imageFile = formData.get('imageFile') as File | null;

    if (!id || !name || !role || !email) {
        return NextResponse.json({ message: 'Missing required fields: id, name, role, or email.' }, { status: 400 });
    }

    const newBoardMemberData: any = {
      name: name,
      role: role,
      email: email, 
      term: term || '',
      slug: slug ? slug.toLowerCase().replace(/\s+/g, '-') : id.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      // order: is no longer set here, keep existing or default in Firestore if needed for other sorting
      imageUrl: '', 
      createdAt: FieldValue.serverTimestamp(),
      createdBy: adminCheck.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminCheck.uid,
    };

    // If 'order' is crucial for other parts and needs a default, set it only on creation.
    // For updates, we generally want to preserve the existing order unless explicitly changed.
    // Since 'order' is removed from the form, we'll rely on existing values or Firestore defaults.
    // A default order could be set in Firestore rules or when documents are first created, e.g., 99.

    let uploadedImageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      try {
        uploadedImageUrl = await uploadBoardMemberImageToFirebaseAdmin(imageFile);
        newBoardMemberData.imageUrl = uploadedImageUrl;
      } catch (uploadError: any) {
        console.error('Board member image upload to Firebase Storage failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading board member image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    }
    
    const memberDocRef = firestoreDb.collection("boardMembers").doc(id);
    
    try {
      await memberDocRef.set(newBoardMemberData, { merge: true }); 
      return NextResponse.json({
        message: `Board member data processed and saved to Firestore with ID: ${id}. ${uploadedImageUrl ? 'Image uploaded.' : 'No image uploaded/changed.'}`,
        firestoreId: id,
        imageUrl: newBoardMemberData.imageUrl,
      }, { status: 200 });

    } catch (firestoreError: any) {
      console.error('Error saving board member document to Firestore:', firestoreError);
      if (uploadedImageUrl) {
        try {
           const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
           if (bucketName) {
            const objectPath = new URL(uploadedImageUrl).pathname.substring(1).split('/').slice(1).join('/');
            await adminApp.storage().bucket(bucketName).file(objectPath).delete();
            console.log(`Rolled back: Deleted board member image ${objectPath} from Firebase Storage due to Firestore error.`);
           }
        } catch (deleteError) {
          console.error(`Error deleting image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving board member data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing board member submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized for fetching board members.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const membersCollectionRef = firestoreDb.collection("boardMembers");
    // Still useful to sort by order if that field exists and has meaning for other contexts
    const q = membersCollectionRef.orderBy("order", "asc").orderBy("name", "asc");
    const querySnapshot = await q.get();
    
    const members: any[] = [];
    querySnapshot.forEach((doc) => {
      members.push({
        docId: doc.id, 
        ...doc.data(),
      });
    });
    
    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching board members from Firestore:", error);
    return NextResponse.json({ message: 'Error fetching board members.', error: error.message || String(error) }, { status: 500 });
  }
}

    