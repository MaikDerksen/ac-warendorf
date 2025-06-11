
import { type NextRequest, NextResponse } from 'next/server';
import { adminApp } from './firebaseAdminConfig';
import type admin from 'firebase-admin';

interface AdminVerificationResult {
  isAdmin: boolean;
  uid?: string;
  error?: string;
  status?: number;
}

export async function verifyAdmin(req: NextRequest): Promise<AdminVerificationResult> {
  if (!adminApp) {
    console.error('Admin SDK not initialized. Cannot verify admin.');
    return { isAdmin: false, error: 'Admin SDK not configured', status: 500 };
  }

  const authorizationHeader = req.headers.get('Authorization');
  if (!authorizationHeader) {
    return { isAdmin: false, error: 'No Authorization header provided', status: 401 };
  }

  if (!authorizationHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'Invalid Authorization header format', status: 401 };
  }

  const idToken = authorizationHeader.split('Bearer ')[1];
  if (!idToken) {
    return { isAdmin: false, error: 'No ID token provided in Authorization header', status: 401 };
  }

  try {
    const decodedToken = await adminApp.auth().verifyIdToken(idToken);
    if (decodedToken.isAdmin === true) {
      return { isAdmin: true, uid: decodedToken.uid };
    } else {
      return { isAdmin: false, error: 'User is not an admin', status: 403 };
    }
  } catch (error: any) {
    console.error('Error verifying Firebase ID token:', error.message);
    let errorMessage = 'Invalid or expired token';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token has expired. Please re-authenticate.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format.';
    }
    // Add more specific error codes as needed
    return { isAdmin: false, error: errorMessage, status: 401 };
  }
}
