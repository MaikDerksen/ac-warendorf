
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';

async function uploadFileToFirebaseAdmin(file: File, pathPrefix: string): Promise<string> {
  if (!adminApp) {
    throw new Error('Admin SDK not initialized for file upload.');
  }
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket name not configured in environment variables.');
  }
  const bucket = adminApp.storage().bucket(bucketName);
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `${pathPrefix}${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || 'application/octet-stream',
    },
    public: true, 
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error(`Firebase Admin Storage upload error (${pathPrefix}):`, err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log(`File uploaded to (${pathPrefix}):`, publicUrl);
      resolve(publicUrl);
    });
    blobStream.end(fileBuffer);
  });
}

export async function GET(req: NextRequest) {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for homepage images GET.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return NextResponse.json({ 
        logoUrl: data?.logoUrl || '',
        homepageHeroImageUrl: data?.homepageHeroImageUrl || '',
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        logoUrl: '',
        homepageHeroImageUrl: '',
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching homepage image settings from Firestore:", error);
    return NextResponse.json({ message: 'Error fetching settings.', error: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is updating site images.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for site images POST.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    const logoFile = formData.get('logoFile') as File | null;
    const homepageHeroImageFile = formData.get('homepageHeroImageFile') as File | null;
    
    const settingsToUpdate: any = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminCheck.uid,
    };

    let newLogoUrl: string | undefined = undefined;
    let newHeroImageUrl: string | undefined = undefined;

    if (logoFile && logoFile.size > 0) {
      try {
        newLogoUrl = await uploadFileToFirebaseAdmin(logoFile, 'general/site_logo/');
        settingsToUpdate.logoUrl = newLogoUrl;
      } catch (uploadError: any) {
        return NextResponse.json({ message: 'Error uploading logo.', error: uploadError.message }, { status: 500 });
      }
    }

    if (homepageHeroImageFile && homepageHeroImageFile.size > 0) {
      try {
        newHeroImageUrl = await uploadFileToFirebaseAdmin(homepageHeroImageFile, 'general/site_hero/');
        settingsToUpdate.homepageHeroImageUrl = newHeroImageUrl;
      } catch (uploadError: any) {
        if (newLogoUrl && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
          try {
            const logoObjectPath = new URL(newLogoUrl).pathname.substring(1); 
            const pathWithoutBucket = logoObjectPath.split('/').slice(1).join('/'); 
            await adminApp.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).file(pathWithoutBucket).delete();
            console.log(`Rolled back logo: ${pathWithoutBucket}`);
          } catch (deleteError) { console.error("Error rolling back logo upload:", deleteError); }
        }
        return NextResponse.json({ message: 'Error uploading hero image.', error: uploadError.message }, { status: 500 });
      }
    }
    
    if (Object.keys(settingsToUpdate).length <= 2 && !newLogoUrl && !newHeroImageUrl) { // only updatedAt and updatedBy
        return NextResponse.json({ message: 'No new image data provided to update.' }, { status: 400 });
    }

    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    await settingsDocRef.set(settingsToUpdate, { merge: true });

    return NextResponse.json({ 
        message: 'Site images updated successfully.', 
        updatedFields: {
            ...(newLogoUrl && { logoUrl: newLogoUrl }),
            ...(newHeroImageUrl && { homepageHeroImageUrl: newHeroImageUrl }),
        }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating site images:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}

    