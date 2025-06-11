
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { File } from 'formidable';
import fs from 'fs/promises';
import { db, storage } from '@/lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { verifyAdmin } from '@/lib/adminAuth'; // Import the admin verification helper

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

async function uploadFileToFirebase(file: File): Promise<string> {
  const fileBuffer = await fs.readFile(file.filepath);
  const uniqueFilename = `${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const storageRef = ref(storage, `pilots/${uniqueFilename}`);
  
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.mimetype || undefined,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Pilot image upload is ' + progress + '% done');
      },
      async (error) => {
        console.error("Firebase Storage upload error (Pilots):", error);
         try {
          await fs.unlink(file.filepath);
        } catch (unlinkError) {
          console.error("Error deleting temp formidable file after failed pilot image upload:", unlinkError);
        }
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Pilot image file available at', downloadURL);
          await fs.unlink(file.filepath);
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL for pilot image or deleting temp file:", error);
          reject(error);
        }
      }
    );
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is performing this action (pilot creation).`);

  let tempFilePath: string | undefined;

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
      createdAt: serverTimestamp(),
      createdBy: adminCheck.uid, // Store admin UID
    };

    let uploadedImageUrl: string | null = null;

    if (imageFile && imageFile.originalFilename) {
      try {
        uploadedImageUrl = await uploadFileToFirebase(imageFile);
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
      const docRef = await addDoc(collection(db, "pilots"), newPilotData);
      return NextResponse.json({
        message: `Pilot data processed and added to Firestore with ID: ${docRef.id}. ${uploadedImageUrl ? 'Image uploaded to Firebase Storage.' : 'No image uploaded.'}`,
        firestoreId: docRef.id,
        imageUrl: newPilotData.imageUrl || 'No image uploaded or saved.',
      }, { status: 200 });
    } catch (firestoreError: any) {
      console.error('Error adding pilot document to Firestore:', firestoreError);
      if (uploadedImageUrl) {
        try {
          const imageRef = ref(storage, uploadedImageUrl);
          await deleteObject(imageRef);
          console.log(`Rolled back: Deleted pilot image ${uploadedImageUrl} from Firebase Storage due to Firestore error.`);
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
