
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { File } from 'formidable';
import fs from 'fs/promises'; // Keep for reading file buffer
import path from 'path';
import { db, storage } from '@/lib/firebaseConfig'; // Import Firestore and Storage instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Disable Next.js body parsing to allow formidable to handle it
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

async function uploadFileToFirebase(file: File): Promise<string> {
  const fileBuffer = await fs.readFile(file.filepath);
  const storageRef = ref(storage, `news/${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9_.-]/g, '_')}`);
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.mimetype || undefined,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error("Firebase Storage upload error:", error);
        // Attempt to clean up the temp formidable file if it exists
        if (file.filepath) {
          fs.unlink(file.filepath).catch(unlinkErr => console.error("Error deleting temp formidable file after failed upload:", unlinkErr));
        }
        reject(error);
      },
      async () => {
        // Handle successful uploads on complete
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
           // Clean up the temp formidable file after successful upload
          if (file.filepath) {
            fs.unlink(file.filepath).catch(unlinkErr => console.error("Error deleting temp formidable file after successful upload:", unlinkErr));
          }
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL:", error);
          reject(error);
        }
      }
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    const form = formidable({
      keepExtensions: true,
      // uploadDir is not needed for Firebase Storage, formidable will use OS temp dir
      // maxFileSize: 5 * 1024 * 1024, // 5MB, apply if needed, or handle in Firebase Storage rules
      filter: function ({name, originalFilename, mimetype}) {
        return !!(name === 'heroImageFile' && mimetype && mimetype.includes("image") && originalFilename);
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
      heroImageUrl: '', // Will be updated after Firebase Storage upload
      createdAt: serverTimestamp(),
    };

    let uploadedImageUrl: string | null = null;

    if (heroImageFile && heroImageFile.originalFilename) { // Check originalFilename to ensure it's a real file
      try {
        console.log(`Attempting to upload file: ${heroImageFile.originalFilename} to Firebase Storage.`);
        uploadedImageUrl = await uploadFileToFirebase(heroImageFile);
        newArticleData.heroImageUrl = uploadedImageUrl;
        console.log(`File successfully uploaded to Firebase Storage. URL: ${uploadedImageUrl}`);
      } catch (uploadError: any) {
        console.error('Firebase Storage upload failed:', uploadError);
        // Do not delete formidable temp file here, uploadFileToFirebase handles it
        return NextResponse.json({
          message: 'Error uploading image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No hero image file provided or file was filtered out.');
    }

    // Save to Firestore
    try {
      const docRef = await addDoc(collection(db, "news"), newArticleData);
      console.log("News article added to Firestore with ID: ", docRef.id);
      return NextResponse.json({
        message: `News article data processed and added to Firestore with ID: ${docRef.id}. ${uploadedImageUrl ? 'Image uploaded to Firebase Storage.' : 'No image uploaded.'}`,
        data: newArticleData,
        imagePath: newArticleData.heroImageUrl || 'No image uploaded or saved.',
        firestoreId: docRef.id,
      }, { status: 200 });
    } catch (error: any) {
      console.error('Error adding document to Firestore:', error);
      // Attempt to delete the uploaded image from Firebase Storage if Firestore save fails
      if (uploadedImageUrl) {
        try {
          const imageRef = ref(storage, uploadedImageUrl);
          await deleteObject(imageRef);
          console.log(`Rolled back: Deleted image ${uploadedImageUrl} from Firebase Storage due to Firestore error.`);
        } catch (deleteError) {
          console.error(`Error deleting image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving data to Firestore.', error: error.message || String(error) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    // Attempt to clean up any temp files from formidable if an early error occurs
     if (error.files && error.files.heroImageFile && error.files.heroImageFile[0] && error.files.heroImageFile[0].filepath) {
        fs.unlink(error.files.heroImageFile[0].filepath).catch(unlinkErr => console.error("Error deleting formidable temp file after general error:", unlinkErr));
    }
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
