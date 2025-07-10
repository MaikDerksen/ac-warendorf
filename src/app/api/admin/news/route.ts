
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';
import type { NewsArticle } from '@/types';

export const config = { api: { bodyParser: false } };

async function uploadFileToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) throw new Error('Admin SDK not initialized.');
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Storage bucket name not configured.');
  
  const bucket = adminApp.storage().bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `news/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({ metadata: { contentType: file.type }, public: true });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', () => resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`));
    blobStream.end(fileBuffer);
  });
}

// GET all news articles
export async function GET(req: NextRequest) {
  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  
  try {
    const newsCollectionRef = adminApp.firestore().collection("news").orderBy("date", "desc");
    const querySnapshot = await newsCollectionRef.get();
    const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsArticle[];
    return NextResponse.json(articles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching articles', error: error.message }, { status: 500 });
  }
}

// POST a new news article
export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    const newArticleData: any = {
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      categories: (formData.get('categories') as string || '').split('|').map(c => c.trim()).filter(c => c),
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      youtubeEmbed: formData.get('youtubeEmbed') as string || '',
      dataAiHint: formData.get('dataAiHint') as string || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      authorId: adminCheck.uid,
    };
    
    const heroImageFile = formData.get('heroImageFile') as File | null;
    if (heroImageFile) {
      newArticleData.heroImageUrl = await uploadFileToFirebaseAdmin(heroImageFile);
    }

    const docRef = await firestoreDb.collection("news").add(newArticleData);
    return NextResponse.json({ message: `Article created with ID: ${docRef.id}`, id: docRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating article', error: error.message }, { status: 500 });
  }
}

// PUT (update) a news article
export async function PUT(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const articleId = req.nextUrl.searchParams.get('id');
    if (!articleId) return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    const firestoreDb = adminApp.firestore();

    try {
        const formData = await req.formData();
        const articleRef = firestoreDb.collection("news").doc(articleId);

        const articleToUpdate: any = {
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            categories: (formData.get('categories') as string || '').split('|').map(c => c.trim()).filter(c => c),
            excerpt: formData.get('excerpt') as string,
            content: formData.get('content') as string,
            youtubeEmbed: formData.get('youtubeEmbed') as string || '',
            dataAiHint: formData.get('dataAiHint') as string || '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const heroImageFile = formData.get('heroImageFile') as File | null;
        if (heroImageFile) {
            articleToUpdate.heroImageUrl = await uploadFileToFirebaseAdmin(heroImageFile);
        }

        await articleRef.update(articleToUpdate);
        return NextResponse.json({ message: 'Article updated successfully' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating article', error: error.message }, { status: 500 });
    }
}


// DELETE a news article
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const articleId = req.nextUrl.searchParams.get('id');
    if (!articleId) return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        await adminApp.firestore().collection("news").doc(articleId).delete();
        // Note: This does not delete the associated image from Firebase Storage. That would require storing the full path and implementing a separate deletion logic for the file.
        return NextResponse.json({ message: 'Article deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting article', error: error.message }, { status: 500 });
    }
}
