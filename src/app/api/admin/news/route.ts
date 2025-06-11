
import { type NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import type { Fields, Files } from 'formidable';
import fs from 'fs/promises'; // For potential future use, not saving files in this version
import path from 'path'; // For potential future use

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
  heroImageFile?: formidable.File;
}

export async function POST(req: NextRequest) {
  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req as any); // Cast to any due to NextRequest vs IncomingMessage types

    const typedFields: { [key: string]: string | string[] } = {};
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        // formidable wraps single field values in an array, unwrap them
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


    let heroImageFile: formidable.File | undefined = undefined;
    if (files.heroImageFile && Array.isArray(files.heroImageFile) && files.heroImageFile.length > 0) {
      heroImageFile = files.heroImageFile[0];
    }

    const newArticleData: any = {
      slug,
      title,
      date,
      categories: categories || '', // Store as string, to be split later or handle based on CSV format
      excerpt,
      content,
      youtubeEmbed: youtubeEmbed || '',
      dataAiHint: dataAiHint || '',
      heroImageUrl: '', // Placeholder for image URL
    };

    if (heroImageFile) {
      console.log('Received file:', {
        name: heroImageFile.originalFilename,
        type: heroImageFile.mimetype,
        size: heroImageFile.size,
      });
      // SIMULATE SAVING FILE & CONSTRUCTING URL
      // In a real backend, you would save this file to cloud storage (e.g., S3, Firebase Storage)
      // or a persistent disk and get a URL.
      // For this simulation, we'll just create a hypothetical path.
      const hypotheticalImageName = `hero_${Date.now()}_${heroImageFile.originalFilename}`;
      const hypotheticalImageUrl = `/images/news_uploads/${hypotheticalImageName}`; // Example path
      newArticleData.heroImageUrl = hypotheticalImageUrl;
      
      console.log(`File would be "saved" to a persistent storage and accessible at: ${hypotheticalImageUrl}`);
      // IMPORTANT: The line below to actually save is commented out because
      // writing to the filesystem (especially `public` dir) at runtime from a Next.js API route
      // is problematic in many deployment environments (serverless, Vercel, Netlify).
      // It's also not a good practice for user-uploaded content management.
      // await fs.copyFile(heroImageFile.filepath, path.join(process.cwd(), 'public', 'images', 'news_uploads', hypotheticalImageName));
      // console.log('File was hypothetically copied to public/images/news_uploads/ - THIS IS NOT PRODUCTION READY');
    }

    console.log('Simulating adding new news article to CSV/database:', newArticleData);
    // In a real backend:
    // 1. Validate data thoroughly.
    // 2. Append to news.csv (ensuring proper CSV formatting and escaping).
    //    This requires careful file handling to avoid corruption, especially with concurrent access.
    //    Example: const csvLine = `"${newArticleData.slug}","${newArticleData.title}",...`;
    //             await fs.appendFile(path.join(process.cwd(), 'src', 'data', 'news', 'news.csv'), `\n${csvLine}`);
    //    THIS IS HIGHLY SIMPLIFIED AND NOT PRODUCTION-READY FOR CSV WRITING.
    // 3. Or, insert into a database.

    return NextResponse.json({ message: 'News article data received and processed (simulated).', data: newArticleData }, { status: 200 });

  } catch (error) {
    console.error('Error processing news article submission:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message }, { status: 500 });
  }
}
