
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import type admin from 'firebase-admin'; // Keep this for admin.storage type if needed

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
  // Sanitize filename and ensure a unique name
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `${pathPrefix}${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type || 'application/octet-stream',
    },
    public: true, // Make the file publicly readable
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

// GET current homepage settings
export async function GET(req: NextRequest) {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for homepage contacts GET.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return NextResponse.json({ 
        contactPersonIds: data?.contactPersonIds || [],
        logoUrl: data?.logoUrl || '',
        homepageHeroImageUrl: data?.homepageHeroImageUrl || '',
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        contactPersonIds: [],
        logoUrl: '',
        homepageHeroImageUrl: '',
      }, { status: 200 }); // Return empty if not set
    }
  } catch (error: any) {
    console.error("Error fetching homepage settings from Firestore:", error);
    return NextResponse.json({ message: 'Error fetching settings.', error: error.message || String(error) }, { status: 500 });
  }
}


// POST to update homepage settings (contacts, logo, hero image)
export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.isAdmin || !adminCheck.uid) {
    return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status || 401 });
  }
  console.log(`Admin user ${adminCheck.uid} is updating site settings.`);

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in API route for site settings POST.");
    return NextResponse.json({ message: 'Server configuration error: Admin SDK not available.' }, { status: 500 });
  }
  const firestoreDb = adminApp.firestore();

  try {
    const formData = await req.formData();
    const contactPersonIdsString = formData.get('contactPersonIds') as string | null;
    const logoFile = formData.get('logoFile') as File | null;
    const homepageHeroImageFile = formData.get('homepageHeroImageFile') as File | null;

    let contactPersonIds: string[] = [];
    if (contactPersonIdsString) {
        try {
            contactPersonIds = JSON.parse(contactPersonIdsString);
            if (!Array.isArray(contactPersonIds) || contactPersonIds.some(id => typeof id !== 'string')) {
                return NextResponse.json({ message: 'Invalid data format: contactPersonIds must be an array of strings.' }, { status: 400 });
            }
            if (contactPersonIds.length > 4) {
                return NextResponse.json({ message: 'Cannot select more than 4 contact persons.' }, { status: 400 });
            }
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON format for contactPersonIds.' }, { status: 400 });
        }
    }
    
    const settingsToUpdate: any = {
      contactPersonIds: contactPersonIds,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminCheck.uid,
    };

    let newLogoUrl: string | undefined = undefined;
    let newHeroImageUrl: string | undefined = undefined;

    if (logoFile && logoFile.size > 0) {
      try {
        // New path for logo: general/site_logo/
        newLogoUrl = await uploadFileToFirebaseAdmin(logoFile, 'general/site_logo/');
        settingsToUpdate.logoUrl = newLogoUrl;
      } catch (uploadError: any) {
        return NextResponse.json({ message: 'Error uploading logo.', error: uploadError.message }, { status: 500 });
      }
    }

    if (homepageHeroImageFile && homepageHeroImageFile.size > 0) {
      try {
        // New path for hero image: general/site_hero/
        newHeroImageUrl = await uploadFileToFirebaseAdmin(homepageHeroImageFile, 'general/site_hero/');
        settingsToUpdate.homepageHeroImageUrl = newHeroImageUrl;
      } catch (uploadError: any) {
        // Basic rollback for logo if hero upload fails
        if (newLogoUrl && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
          try {
            // Construct path based on how uploadFileToFirebaseAdmin forms it
            const logoObjectPath = new URL(newLogoUrl).pathname.substring(1); // e.g. bucketName/general/site_logo/timestamp_filename.ext
            const pathWithoutBucket = logoObjectPath.split('/').slice(1).join('/'); // e.g. general/site_logo/timestamp_filename.ext
            await adminApp.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).file(pathWithoutBucket).delete();
            console.log(`Rolled back logo: ${pathWithoutBucket}`);
          } catch (deleteError) { console.error("Error rolling back logo upload:", deleteError); }
        }
        return NextResponse.json({ message: 'Error uploading hero image.', error: uploadError.message }, { status: 500 });
      }
    }
    
    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    await settingsDocRef.set(settingsToUpdate, { merge: true });

    return NextResponse.json({ 
        message: 'Site settings updated successfully.', 
        updatedFields: {
            contactPersonIds,
            ...(newLogoUrl && { logoUrl: newLogoUrl }),
            ...(newHeroImageUrl && { homepageHeroImageUrl: newHeroImageUrl }),
        }
    }, { status: 200 });

  } catch (error: any)
{
    console.error('Error updating site settings:', error);
    return NextResponse.json({ message: 'Error processing request.', error: error.message || String(error) }, { status: 500 });
  }
}

    