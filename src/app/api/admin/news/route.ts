
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

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
  heroImageFile?: File; // formidable.File is typically just 'File' from formidable
}

// Ensure the upload directory exists (you might want to do this on server start or build)
// For this example, we'll attempt it here, but it's better done elsewhere.
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'news_uploads');

async function ensureUploadDirExists() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ensured: ${UPLOAD_DIR}`);
  } catch (error) {
    console.error(`Error creating upload directory ${UPLOAD_DIR}:`, error);
    // Depending on the error, you might want to throw it or handle it
  }
}


export async function POST(req: NextRequest) {
  await ensureUploadDirExists(); // Attempt to create upload dir if it doesn't exist

  try {
    const form = formidable({
      uploadDir: UPLOAD_DIR, // Specify our upload directory
      keepExtensions: true, // Keep original file extensions
      filename: (name, ext, part, form) => { // Custom filename logic
        // originalFilename might be undefined for some parts, ensure it's for file parts
        const originalFilename = part.originalFilename || `file-${Date.now()}`;
        return `hero_${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      },
      filter: function ({name, originalFilename, mimetype}) {
        // keep only images
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
      slug,
      title,
      date,
      categories: categories || '',
      excerpt,
      content,
      youtubeEmbed: youtubeEmbed || '',
      dataAiHint: dataAiHint || '',
      heroImageUrl: '', // Placeholder for image URL
    };

    if (heroImageFile && heroImageFile.newFilename) {
      // 'newFilename' is set by formidable when a file is successfully saved to 'uploadDir'
      const savedImageName = heroImageFile.newFilename;
      const imageUrl = `/images/news_uploads/${savedImageName}`;
      newArticleData.heroImageUrl = imageUrl;
      
      console.log(`File successfully saved to: ${path.join(UPLOAD_DIR, savedImageName)}`);
      console.log(`Image will be accessible at URL: ${imageUrl}`);
    } else if (heroImageFile) {
      // This case might happen if formidable didn't save the file as expected
      // or if the file was filtered out.
      console.log('Hero image file was present in the form data but not saved by formidable. Original name:', heroImageFile.originalFilename);
      // You might want to delete the temporary file if formidable didn't move it.
      // formidable usually cleans up its temp files if not moved.
      if (heroImageFile.filepath && heroImageFile.filepath !== path.join(UPLOAD_DIR, heroImageFile.newFilename || '')) {
         try { await fs.unlink(heroImageFile.filepath); console.log("Cleaned up temp file:", heroImageFile.filepath)} catch (e) {console.error("Error cleaning temp file:", e)}
      }
    }


    console.log('--- NEWS ARTICLE DATA TO BE PERSISTED ---');
    console.log(JSON.stringify(newArticleData, null, 2));
    console.log('------------------------------------------');
    console.warn('IMPORTANT: CSV/Database update is NOT implemented in this version.');
    console.warn('The new article data above needs to be manually added to news.csv or a database for it to appear on the site.');
    console.warn('For the image to appear, ensure it was saved correctly in public/images/news_uploads/ and the site might need a restart/redeploy if caching is involved.');

    return NextResponse.json({
      message: 'News article data received. Image (if provided) processed. Data persistence is SIMULATED (check server logs).',
      data: newArticleData,
      imagePath: newArticleData.heroImageUrl || 'No image uploaded or saved.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing news article submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}
