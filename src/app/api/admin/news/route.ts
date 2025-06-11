
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { File } from 'formidable';
import fs from 'fs/promises';
import { adminApp } from '@/lib/firebaseAdminConfig'; // Use Admin SDK
import { verifyAdmin } from '@/lib/adminAuth';
import type admin from 'firebase-admin';

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
  const bucket = adminApp.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET); // Default bucket
  const fileBuffer = await fs.readFile(file.filepath);
  const uniqueFilename = `news/${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype || undefined,
    },
    public: true, // Make the file publicly readable
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', async (err) => {
      console.error("Firebase Admin Storage upload error:", err);
      try {
        await fs.unlink(file.filepath); // Clean up temp file
      } catch (unlinkError) {
        console.error("Error deleting temp formidable file after failed upload:", unlinkError);
      }
      reject(err);
    });

    blobStream.on('finish', async () => {
      // The file is now publicly readable, construct the URL
      // Standard URL format: https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_NAME]
      // Or, for Firebase Console friendly URLs (if using Firebase Hosting rewrite or direct Firebase Storage URLs):
      // https://firebasestorage.googleapis.com/v0/b/[BUCKET_NAME]/o/[OBJECT_NAME_ENCODED]?alt=media
      // For simplicity with public: true, the direct GCS URL is often easiest.
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log('File uploaded to:', publicUrl);
      try {
        await fs.unlink(file.filepath); // Clean up temp file
      } catch (unlinkError) {
        console.error("Error deleting temp formidable file after successful upload:", unlinkError);
      }
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

  let tempFilePath: string | undefined;

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const form = formidable({
      keepExtensions: true,
      filter: function ({name, originalFilename, mimetype}) {
        const isImageField = name === 'heroImageFile';
        const isActualFile = !!(originalFilename && mimetype && mimetype.includes("image"));
        if (isImageField && !isActualFile && originalFilename) {
             console.warn(`File field 'heroImageFile' received with originalFilename '${originalFilename}' but invalid mimetype '${mimetype}'. It will be ignored.`);
        }
        return isImageField && isActualFile;
      }
    });

    const [fields, files] = await form.parse(req as any);
    
    const typedFields: { [key: string]: string | string[] } = {};
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        typedFields[key] = Array.isArray(fields[key]) && fields[key].length === 1 ? fields[key][0] : fields[key];
      }
    }

    const {
      slug,
      title,
      date,
      categories,
      excerpt,
      content,
      youtubeEmbed,
      dataAiHint,
    } = typedFields as unknown as Omit<NewsFormData, 'heroImageFile'>;

    let heroImageFile: File | undefined = undefined;
    if (files.heroImageFile && Array.isArray(files.heroImageFile) && files.heroImageFile.length > 0) {
      heroImageFile = files.heroImageFile[0];
      tempFilePath = heroImageFile.filepath; 
    }

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
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Admin SDK server timestamp
      authorId: adminCheck.uid,
    };

    let uploadedImageUrl: string | null = null;

    if (heroImageFile && heroImageFile.originalFilename) {
      try {
        uploadedImageUrl = await uploadFileToFirebaseAdmin(heroImageFile);
        newArticleData.heroImageUrl = uploadedImageUrl;
        tempFilePath = undefined; 
      } catch (uploadError: any) {
        console.error('Firebase Admin Storage upload failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No hero image file provided or file was filtered out.');
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
          // To delete from GCS, you need the object path (e.g., 'news/image.jpg')
          const objectPath = new URL(uploadedImageUrl).pathname.substring(1).split('/').slice(1).join('/'); // news/image.jpg
          await adminApp.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).file(objectPath).delete();
          console.log(`Rolled back: Deleted image ${objectPath} from Firebase Storage due to Firestore error.`);
        } catch (deleteError) {
          console.error(`Error deleting image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    if (tempFilePath) { 
        try {
            await fs.unlink(tempFilePath);
            console.log('Cleaned up formidable temp file after general error.');
        } catch (unlinkErr) {
            console.error("Error deleting formidable temp file after general error:", unlinkErr);
        }
    }
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
