
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
  const uniqueFilename = `${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const storageRef = ref(storage, `news/${uniqueFilename}`);
  
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.mimetype || undefined,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      async (error) => {
        console.error("Firebase Storage upload error:", error);
        try {
          await fs.unlink(file.filepath); // Clean up temp file
        } catch (unlinkError) {
          console.error("Error deleting temp formidable file after failed upload:", unlinkError);
        }
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
          await fs.unlink(file.filepath); // Clean up temp file
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL or deleting temp file:", error);
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

  // Admin is verified, proceed with the news article creation
  console.log(`Admin user ${adminCheck.uid} is performing this action.`);

  let tempFilePath: string | undefined; // To store the path of the formidable temp file

  try {
    const form = formidable({
      keepExtensions: true,
      filter: function ({name, originalFilename, mimetype}) {
        const isImageField = name === 'heroImageFile';
        const isActualFile = !!(originalFilename && mimetype && mimetype.includes("image"));
        if (isImageField && !isActualFile && originalFilename) { // field is heroImageFile but not a valid image
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
      tempFilePath = heroImageFile.filepath; // Store temp file path for cleanup
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
      createdAt: serverTimestamp(),
      authorId: adminCheck.uid, // Store the UID of the admin who created the article
    };

    let uploadedImageUrl: string | null = null;

    if (heroImageFile && heroImageFile.originalFilename) {
      try {
        uploadedImageUrl = await uploadFileToFirebase(heroImageFile);
        newArticleData.heroImageUrl = uploadedImageUrl;
        tempFilePath = undefined; // File has been handled by uploadFileToFirebase (moved/deleted)
      } catch (uploadError: any) {
        console.error('Firebase Storage upload failed:', uploadError);
        return NextResponse.json({
          message: 'Error uploading image to Firebase Storage.',
          error: uploadError.message || String(uploadError)
        }, { status: 500 });
      }
    } else {
      console.log('No hero image file provided or file was filtered out.');
    }

    try {
      const docRef = await addDoc(collection(db, "news"), newArticleData);
      return NextResponse.json({
        message: `News article processed and added to Firestore with ID: ${docRef.id}. ${uploadedImageUrl ? 'Image uploaded to Firebase Storage.' : 'No image uploaded.'}`,
        firestoreId: docRef.id,
        imagePath: newArticleData.heroImageUrl || 'No image uploaded or saved.',
      }, { status: 200 });
    } catch (firestoreError: any) {
      console.error('Error adding document to Firestore:', firestoreError);
      if (uploadedImageUrl) {
        try {
          const imageRef = ref(storage, uploadedImageUrl);
          await deleteObject(imageRef);
          console.log(`Rolled back: Deleted image ${uploadedImageUrl} from Firebase Storage due to Firestore error.`);
        } catch (deleteError) {
          console.error(`Error deleting image from Firebase Storage during rollback: ${deleteError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving data to Firestore.', error: firestoreError.message || String(firestoreError) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    if (tempFilePath) { // If an error occurred before file was handled by uploadFileToFirebase
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
