
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';
import type { PhotoAlbum, NewsArticle, UnifiedAlbum } from '@/types';

export const config = { api: { bodyParser: false } };

async function uploadGalleryImage(file: File, albumId: string): Promise<string> {
    if (!adminApp) throw new Error('Admin SDK not initialized.');
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) throw new Error('Storage bucket name not configured.');

    const bucket = adminApp.storage().bucket(bucketName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `gallery/${albumId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    const blob = bucket.file(uniqueFilename);
    const blobStream = blob.createWriteStream({ metadata: { contentType: file.type }, public: true });

    return new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', () => resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`));
        blobStream.end(fileBuffer);
    });
}

// GET all albums (manual and news-based)
export async function GET(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    const firestoreDb = adminApp.firestore();
    try {
        // Fetch manual albums
        const manualAlbumsSnapshot = await firestoreDb.collection("photoAlbums").orderBy("date", "desc").get();
        const manualAlbums: UnifiedAlbum[] = manualAlbumsSnapshot.docs.map(doc => {
            const data = doc.data() as PhotoAlbum;
            return {
                id: data.id,
                title: data.name,
                date: data.date,
                coverImageUrl: data.coverImageUrl,
                type: 'manual'
            };
        });

        // Fetch news articles and filter for those with galleries in code.
        // This is more robust than a complex query that might require a composite index.
        const allNewsSnapshot = await firestoreDb.collection("news").orderBy("date", "desc").get();
        const newsAlbums: UnifiedAlbum[] = [];
        allNewsSnapshot.forEach(doc => {
            const data = doc.data() as NewsArticle;
            if (data.galleryImageUrls && Array.isArray(data.galleryImageUrls) && data.galleryImageUrls.length > 0) {
                 newsAlbums.push({
                    id: doc.id,
                    slug: data.slug,
                    title: data.title,
                    date: data.date,
                    coverImageUrl: data.galleryImageUrls?.[0] || data.heroImageUrl,
                    type: 'news'
                });
            }
        });
        
        const allAlbums = [...manualAlbums, ...newsAlbums].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return NextResponse.json(allAlbums, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching combined albums:", error);
        return NextResponse.json({ message: 'Error fetching albums', error: error.message }, { status: 500 });
    }
}


// POST a new photo album
export async function POST(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin || !adminCheck.uid) {
        return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
    }
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    const firestoreDb = adminApp.firestore();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const date = formData.get('date') as string;
        const images = formData.getAll('images') as File[];

        if (!name || !date || !images || images.length === 0) {
            return NextResponse.json({ message: 'Missing required fields: name, date, and images are required.' }, { status: 400 });
        }

        const albumRef = firestoreDb.collection("photoAlbums").doc();
        const albumId = albumRef.id;

        const imageUrls = await Promise.all(
            images.map(image => uploadGalleryImage(image, albumId))
        );

        const newAlbumData: PhotoAlbum = {
            id: albumId,
            name: name,
            date: date,
            imageUrls: imageUrls,
            coverImageUrl: imageUrls[0], // Use the first image as the cover
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: adminCheck.uid,
        };

        await albumRef.set(newAlbumData);
        return NextResponse.json({ message: 'Album created successfully', album: newAlbumData }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating photo album:", error);
        return NextResponse.json({ message: 'Error creating album', error: error.message }, { status: 500 });
    }
}

// PUT (update) an existing photo album
export async function PUT(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin || !adminCheck.uid) {
        return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
    }
    const albumId = req.nextUrl.searchParams.get('id');
    if (!albumId) return NextResponse.json({ message: 'Album ID is required for update.' }, { status: 400 });
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    const firestoreDb = adminApp.firestore();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const date = formData.get('date') as string;
        const newImages = formData.getAll('images') as File[];

        const albumRef = firestoreDb.collection("photoAlbums").doc(albumId);
        const updateData: any = {
            name,
            date,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (newImages && newImages.length > 0) {
            const newImageUrls = await Promise.all(newImages.map(image => uploadGalleryImage(image, albumId)));
            updateData.imageUrls = admin.firestore.FieldValue.arrayUnion(...newImageUrls);
        }

        await albumRef.update(updateData);
        return NextResponse.json({ message: 'Album updated successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating photo album:", error);
        return NextResponse.json({ message: 'Error updating album', error: error.message }, { status: 500 });
    }
}

// DELETE an existing photo album
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });
    const albumId = req.nextUrl.searchParams.get('id');
    if (!albumId) return NextResponse.json({ message: 'Album ID is required for deletion.' }, { status: 400 });
    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const firestoreDb = adminApp.firestore();
        await firestoreDb.collection("photoAlbums").doc(albumId).delete();
        // Note: This does not delete the images from Storage to prevent accidental data loss.
        // This could be implemented as a more advanced "hard delete" feature in the future.
        return NextResponse.json({ message: 'Album deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting photo album:", error);
        return NextResponse.json({ message: 'Error deleting album', error: error.message }, { status: 500 });
    }
}
