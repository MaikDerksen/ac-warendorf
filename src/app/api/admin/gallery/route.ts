
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import admin from 'firebase-admin';

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

// POST a new photo album
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

        const newAlbumData = {
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
