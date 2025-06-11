
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import type admin from 'firebase-admin';

export const config = {
  api: {
    bodyParser: false, // No longer strictly necessary with req.formData(), but doesn't hurt
  },
};

interface PilotFormData {
  name: string;
  profileSlug?: string;
  bio?: string;
  achievements?: string;
  imageFile?: File; // Web API File type
}

async function uploadPilotImageToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) {
    throw new Error('Admin SDK not initialized for file upload.');
  }
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket name not configured in environment variables.');
  }
  const bucket = adminApp.storage().bucket(bucketName);
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `pilots/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || undefined,
    },
    public: true, // Make the file publicly readable
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error("Firebase Admin Storage upload error (Pilots):", err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log('Pilot image file available at', publicUrl);
      resolve(publicUrl);
    });
    blobStream.end(fileBuffer);
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is creating a pilot profile.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for pilots.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const profileSlug = formData.get('profileSlug') as string | undefined;
    const bio = formData.get('bio') as string | undefined;
    const achievements = formData.get('achievements') as string | undefined;
    const imageFile = formData.get('imageFile') as File | null;

    const newPilotData: any = {
      name: name || '',
      profileSlug: profileSlug ? profileSlug.toLowerCase().replace(/\s+/g, '-') : '',
      bio: bio || '',
      achievements: achievements ? achievements.split('|').map(a => a.trim()) : [],
      imageUrl: '', 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: adminCheck.uid,
    };

    let uploadedImageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      try {
        uploadedImageUrl = await uploadPilotImageToFirebaseAdmin(imageFile);
        newPilotData.imageUrl = uploadedImageUrl;
      } catch (uploadError: any) {
        console.error('Pilot image upload to Firebase Storage failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading pilot image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No pilot image file provided or file was empty.');
    }

    try {
      const docRef = await firestoreDb.collection("pilots").add(newPilotData);
      return NextResponse.json({
        message: `Pilot data processed and added to Firestore with ID: ${docRef.id}. ${uploadedImageUrl ? 'Image uploaded to Firebase Storage.' : 'No image uploaded.'}`,
        firestoreId: docRef.id,
        imageUrl: newPilotData.imageUrl || 'No image uploaded or saved.',
      }, { status: 200 });
    } catch (firestoreError: any) {
      console.error('Error adding pilot document to Firestore:', firestoreError);
      if (uploadedImageUrl) {
        try {
           const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
           if (bucketName) {
            const objectPath = new URL(uploadedImageUrl).pathname.substring(1).split('/').slice(1).join('/');
            await adminApp.storage().bucket(bucketName).file(objectPath).delete();
            console.log(`Rolled back: Deleted pilot image ${objectPath} from Firebase Storage due to Firestore error.`);
           }
        } catch (deleteError) {
          console.error(`Error deleting pilot image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving pilot data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing pilot submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
