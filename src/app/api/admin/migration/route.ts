
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';

// Expected structure for a post from the WordPress JSON export
interface WpPost {
  post_title: string;
  post_name: string; // This is the slug
  post_date: string; // e.g., "2023-10-27 10:00:00"
  post_content: string;
  post_excerpt: string;
  post_status: string; // We only care about "publish"
}

// Function to convert WordPress date to YYYY-MM-DD format
function formatDate(wpDate: string): string {
  try {
    const date = new Date(wpDate);
    return date.toISOString().split('T')[0];
  } catch (e) {
    // Fallback to current date if parsing fails
    return new Date().toISOString().split('T')[0];
  }
}

// Main handler for the migration
export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
  }

  if (!adminApp) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    const jsonFile = formData.get('wpPostsJson') as File | null;

    if (!jsonFile) {
      return NextResponse.json({ message: 'No JSON file provided.' }, { status: 400 });
    }

    const fileContent = await jsonFile.text();
    const parsedData = JSON.parse(fileContent);

    let posts: WpPost[];
    // Check if the parsed data is an array itself, otherwise look for a 'posts' property
    if (Array.isArray(parsedData)) {
      posts = parsedData;
    } else if (parsedData.posts && Array.isArray(parsedData.posts)) {
      posts = parsedData.posts;
    } else {
      return NextResponse.json({ message: 'Invalid JSON format: Expected an array of posts or an object with a "posts" array.' }, { status: 400 });
    }

    const postsToImport: WpPost[] = posts.filter((post: WpPost) => post.post_status === 'publish');
    
    if (postsToImport.length === 0) {
        return NextResponse.json({ message: 'No published posts found in the file to import.', importedCount: 0, totalCount: posts.length }, { status: 200 });
    }

    const batch = firestoreDb.batch();
    const newsCollectionRef = firestoreDb.collection('news');
    let importedCount = 0;

    for (const post of postsToImport) {
        const slug = post.post_name;
        if (!slug) continue; // Skip posts without a slug

        // To avoid duplicates, we can check if a post with this slug already exists.
        const existingPostQuery = await newsCollectionRef.where('slug', '==', slug).limit(1).get();
        if (!existingPostQuery.empty) {
            console.log(`Skipping existing post with slug: ${slug}`);
            continue; // Skip this post
        }

        const newArticle = {
            title: post.post_title || 'Unbenannter Artikel',
            slug: slug,
            date: formatDate(post.post_date),
            excerpt: post.post_excerpt || post.post_content.substring(0, 150),
            content: post.post_content,
            categories: ['WordPress Import'], // Assign a default category
            authorId: adminCheck.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // Set default empty or placeholder values for other fields
            heroImageUrl: 'https://placehold.co/1200x675.png',
            dataAiHint: 'migrated content',
            youtubeEmbed: '',
        };
        
        const newDocRef = newsCollectionRef.doc(); // Let Firestore generate an ID
        batch.set(newDocRef, newArticle);
        importedCount++;
    }

    await batch.commit();

    return NextResponse.json({ 
        message: 'Migration completed successfully.', 
        importedCount: importedCount, 
        totalCount: postsToImport.length 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error during migration:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON file. Please check the file content and try again.', error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred during migration.', error: error.message }, { status: 500 });
  }
}
