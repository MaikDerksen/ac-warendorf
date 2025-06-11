
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

interface PilotFormData {
  name: string;
  profileSlug?: string;
  bio?: string;
  achievements?: string;
  imageFile?: File;
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
  const fileBuffer = await fs.readFile(file.filepath);
  const uniqueFilename = `pilots/${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype || undefined,
    },
    public: true, // Make the file publicly readable
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', async (err) => {
      console.error("Firebase Admin Storage upload error (Pilots):", err);
       try {
        await fs.unlink(file.filepath);
      } catch (unlinkError) {
        console.error("Error deleting temp formidable file after failed pilot image upload:", unlinkError);
      }
      reject(err);
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log('Pilot image file available at', publicUrl);
      try {
        await fs.unlink(file.filepath);
      } catch (unlinkError) {
         console.error("Error deleting temp formidable file after successful pilot image upload:", unlinkError);
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
  console.log(`Admin user ${adminCheck.uid} is creating a pilot profile.`);

  let tempFilePath: string | undefined;

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for pilots.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const form = formidable({
      keepExtensions: true,
      filter: function ({name, originalFilename, mimetype}) {
        const isImageField = name === 'imageFile';
        const isActualFile = !!(originalFilename && mimetype && mimetype.includes("image"));
         if (isImageField && !isActualFile && originalFilename) {
             console.warn(`File field 'imageFile' (pilot) received with originalFilename '${originalFilename}' but invalid mimetype '${mimetype}'. It will be ignored.`);
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
      name,
      profileSlug,
      bio,
      achievements,
    } = typedFields as unknown as Omit<PilotFormData, 'imageFile'>;

    let imageFile: File | undefined = undefined;
    if (files.imageFile && Array.isArray(files.imageFile) && files.imageFile.length > 0) {
      imageFile = files.imageFile[0];
      tempFilePath = imageFile.filepath;
    }

    const newPilotData: any = {
      name: name || '',
      profileSlug: profileSlug?.toLowerCase().replace(/\s+/g, '-') || '',
      bio: bio || '',
      achievements: achievements ? achievements.split('|').map(a => a.trim()) : [],
      imageUrl: '', 
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Admin SDK server timestamp
      createdBy: adminCheck.uid,
    };

    let uploadedImageUrl: string | null = null;

    if (imageFile && imageFile.originalFilename) {
      try {
        uploadedImageUrl = await uploadPilotImageToFirebaseAdmin(imageFile);
        newPilotData.imageUrl = uploadedImageUrl;
        tempFilePath = undefined;
      } catch (uploadError: any) {
        console.error('Pilot image upload to Firebase Storage failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading pilot image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No pilot image file provided or file was filtered out.');
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
          const objectPath = new URL(uploadedImageUrl).pathname.substring(1).split('/').slice(1).join('/');
          await adminApp.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).file(objectPath).delete();
          console.log(`Rolled back: Deleted pilot image ${objectPath} from Firebase Storage due to Firestore error.`);
        } catch (deleteError) {
          console.error(`Error deleting pilot image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving pilot data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing pilot submission:', error);
    if (tempFilePath) {
        try {
            await fs.unlink(tempFilePath);
            console.log('Cleaned up formidable temp file for pilot after general error.');
        } catch (unlinkErr) {
            console.error("Error deleting formidable temp file for pilot after general error:", unlinkErr);
        }
    }
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}

