
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin'; // Changed from 'import type'

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NewsFormData {
  slug: string;
  title: string;
  date: string;
  categories?: string;
  excerpt: string;
  content: string;
  youtubeEmbed?: string;
  dataAiHint?: string;
  heroImageFile?: File;
}

async function uploadFileToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) {
    throw new Error('Admin SDK not initialized for file upload.');
  }
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket name not configured in environment variables.');
  }
  const bucket = adminApp.storage().bucket(bucketName);
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `news/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || undefined,
    },
    public: true, // Make the file publicly readable
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error("Firebase Admin Storage upload error:", err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log('File uploaded to:', publicUrl);
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
  console.log(`Admin user ${adminCheck.uid} is creating a news article.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    
    const slug = formData.get('slug') as string;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const categories = formData.get('categories') as string | undefined;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const youtubeEmbed = formData.get('youtubeEmbed') as string | undefined;
    const dataAiHint = formData.get('dataAiHint') as string | undefined;
    const heroImageFile = formData.get('heroImageFile') as File | null;

    const newArticleData: any = {
      slug: slug || '',
      title: title || '',
      date: date || new Date().toISOString().split('T')[0],
      categories: categories ? categories.split('|').map(c => c.trim()) : [],
      excerpt: excerpt || '',
      content: content || '',
      youtubeEmbed: youtubeEmbed || '',
      dataAiHint: dataAiHint || '',
      heroImageUrl: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      authorId: adminCheck.uid,
    };

    let uploadedImageUrl: string | null = null;

    if (heroImageFile && heroImageFile.size > 0) {
      try {
        uploadedImageUrl = await uploadFileToFirebaseAdmin(heroImageFile);
        newArticleData.heroImageUrl = uploadedImageUrl;
      } catch (uploadError: any) {
        console.error('Firebase Admin Storage upload failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No hero image file provided or file was empty.');
    }

    try {
      const docRef = await firestoreDb.collection("news").add(newArticleData);
      return NextResponse.json({
        message: `News article processed and added to Firestore with ID: ${docRef.id}. ${uploadedImageUrl ? 'Image uploaded to Firebase Storage.' : 'No image uploaded.'}`,
        firestoreId: docRef.id,
        imagePath: newArticleData.heroImageUrl || 'No image uploaded or saved.',
      }, { status: 200 });
    } catch (firestoreError: any) {
      console.error('Error adding document to Firestore:', firestoreError);
      if (uploadedImageUrl) {
        try {
          const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
          if (bucketName) {
             const objectPath = new URL(uploadedImageUrl).pathname.substring(1).split('/').slice(1).join('/');
             await adminApp.storage().bucket(bucketName).file(objectPath).delete();
             console.log(`Rolled back: Deleted image ${objectPath} from Firebase Storage due to Firestore error.`);
          }
        } catch (deleteError) {
          console.error(`Error deleting image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
