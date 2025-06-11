
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/firebaseConfig'; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'news_uploads');

async function ensureUploadDirExists() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ensured: ${UPLOAD_DIR}`);
  } catch (error) {
    console.error(`Error creating upload directory ${UPLOAD_DIR}:`, error);
  }
}


export async function POST(req: NextRequest) {
  await ensureUploadDirExists(); 

  try {
    const form = formidable({
      uploadDir: UPLOAD_DIR, 
      keepExtensions: true, 
      filename: (name, ext, part, form) => { 
        const originalFilename = part.originalFilename || `file-${Date.now()}`;
        return `hero_${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      },
      filter: function ({name, originalFilename, mimetype}) {
        return !!(mimetype && mimetype.includes("image") && originalFilename);
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
      slug: slug || '', // Ensure slug is not undefined
      title: title || '',
      date: date || new Date().toISOString().split('T')[0],
      categories: categories ? categories.split('|').map(c => c.trim()) : [],
      excerpt: excerpt || '',
      content: content || '',
      youtubeEmbed: youtubeEmbed || '',
      dataAiHint: dataAiHint || '',
      heroImageUrl: '',
      createdAt: serverTimestamp(), // Add a server timestamp
    };

    if (heroImageFile && heroImageFile.newFilename) {
      const savedImageName = heroImageFile.newFilename;
      const imageUrl = `/images/news_uploads/${savedImageName}`;
      newArticleData.heroImageUrl = imageUrl;
      
      console.log(`File successfully saved to: ${path.join(UPLOAD_DIR, savedImageName)}`);
      console.log(`Image will be accessible at URL: ${imageUrl}`);
    } else if (heroImageFile) {
      console.log('Hero image file was present in the form data but not saved. Original name:', heroImageFile.originalFilename);
      if (heroImageFile.filepath && heroImageFile.filepath !== path.join(UPLOAD_DIR, heroImageFile.newFilename || '')) {
         try { await fs.unlink(heroImageFile.filepath); console.log("Cleaned up temp file:", heroImageFile.filepath)} catch (e) {console.error("Error cleaning temp file:", e)}
      }
    }

    // Save to Firestore
    try {
      const docRef = await addDoc(collection(db, "news"), newArticleData);
      console.log("News article added to Firestore with ID: ", docRef.id);
      return NextResponse.json({
        message: `News article data processed. Image (if provided) saved locally. Data added to Firestore with ID: ${docRef.id}.`,
        data: newArticleData,
        imagePath: newArticleData.heroImageUrl || 'No image uploaded or saved.',
        firestoreId: docRef.id,
      }, { status: 200 });
    } catch (error: any) {
      console.error('Error adding document to Firestore:', error);
      // Attempt to delete the locally saved file if Firestore save fails
      if (newArticleData.heroImageUrl) {
        const imagePathToDelete = path.join(process.cwd(), 'public', newArticleData.heroImageUrl);
        try {
          await fs.unlink(imagePathToDelete);
          console.log(`Rolled back: Deleted local image ${newArticleData.heroImageUrl} due to Firestore error.`);
        } catch (unlinkError) {
          console.error(`Error deleting local image during rollback: ${unlinkError}`);
        }
      }
      return NextResponse.json({ message: 'Error saving data to Firestore.', error: error.message || String(error) }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
