
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdminConfig';
import { verifyAdmin } from '@/lib/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';
import type { BoardMember, BoardMemberRole } from '@/types';

export const config = { api: { bodyParser: false } };

async function uploadBoardMemberImageToFirebaseAdmin(file: File): Promise<string> {
  if (!adminApp) throw new Error('Admin SDK not initialized.');
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Storage bucket name not configured.');
  
  const bucket = adminApp.storage().bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueFilename = `vorstand_images/${Date.now()}_${safeOriginalName}`;
  
  const blob = bucket.file(uniqueFilename);
  await blob.save(fileBuffer, { metadata: { contentType: file.type }, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
}

// GET all board members
export async function GET(req: NextRequest) {
  if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  
  try {
    const membersCollectionRef = adminApp.firestore().collection("boardMembers").orderBy("order", "asc").orderBy("name", "asc");
    const querySnapshot = await membersCollectionRef.get();
    const members = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardMember[];
    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching members', error: error.message }, { status: 500 });
  }
}

async function handleRequest(req: NextRequest, isUpdate: boolean) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        const formData = await req.formData();
        const memberId = formData.get('id') as string;
        if (!memberId) return NextResponse.json({ message: 'Member ID is required' }, { status: 400 });

        const memberRef = adminApp.firestore().collection("boardMembers").doc(memberId);
        
        const rolesString = formData.get('roles') as string | null;
        let roles: BoardMemberRole[] = [];
        if (rolesString) {
            try {
                roles = JSON.parse(rolesString);
                if (!Array.isArray(roles) || roles.length === 0) {
                    return NextResponse.json({ message: 'Invalid or empty roles array' }, { status: 400 });
                }
            } catch (e) {
                return NextResponse.json({ message: 'Invalid JSON format for roles' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Roles are required' }, { status: 400 });
        }

        const memberData: any = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roles: roles,
            description: (formData.get('description') as string) || '',
            order: Number(formData.get('order') as string) || 99,
            slug: memberId, // Use the ID as slug
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: adminCheck.uid,
        };
        
        if (!isUpdate) {
            memberData.createdAt = FieldValue.serverTimestamp();
            memberData.createdBy = adminCheck.uid;
        }
        
        const imageFile = formData.get('imageFile') as File | null;
        if (imageFile) {
            memberData.imageUrl = await uploadBoardMemberImageToFirebaseAdmin(imageFile);
        }

        await memberRef.set(memberData, { merge: isUpdate });

        return NextResponse.json({
            message: `Member ${isUpdate ? 'updated' : 'created'} successfully`,
            id: memberId,
        }, { status: isUpdate ? 200 : 201 });

    } catch (error: any) {
        return NextResponse.json({ message: `Error ${isUpdate ? 'updating' : 'creating'} member`, error: error.message }, { status: 500 });
    }
}


// POST a new board member
export async function POST(req: NextRequest) {
    return handleRequest(req, false);
}

// PUT (update) a board member
export async function PUT(req: NextRequest) {
    return handleRequest(req, true);
}


// DELETE a board member
export async function DELETE(req: NextRequest) {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) return NextResponse.json({ message: adminCheck.error || 'Unauthorized' }, { status: 401 });

    const memberId = req.nextUrl.searchParams.get('id');
    if (!memberId) return NextResponse.json({ message: 'Member ID is required' }, { status: 400 });

    if (!adminApp) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

    try {
        await adminApp.firestore().collection("boardMembers").doc(memberId).delete();
        return NextResponse.json({ message: 'Member deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting member', error: error.message }, { status: 500 });
    }
}
