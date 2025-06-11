
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
    console.error('Admin SDK not initialized. Cannot verify admin. Check firebaseAdminConfig.ts and environment variables.');
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

  console.log('Received token for verification (length):', idToken.length);
  // For deeper debugging if necessary, you could uncomment the next line, but be careful logging tokens.
  // console.log('Token starts with:', idToken.substring(0, 30) + "...");


  try {
    const decodedToken = await adminApp.auth().verifyIdToken(idToken);
    if (decodedToken.isAdmin === true) {
      return { isAdmin: true, uid: decodedToken.uid };
    } else {
      return { isAdmin: false, error: 'User is not an admin', status: 403 };
    }
  } catch (error: any) {
    console.error('Error verifying Firebase ID token:');
    console.error('Error Code:', error.code); 
    console.error('Error Message:', error.message);
    // Logging the full error object can sometimes provide more context
    // Be mindful if this logs sensitive details in some error types, though usually it's just error metadata.
    // console.error('Full Error Object:', JSON.stringify(error, null, 2));


    let errorMessage = 'Invalid or expired token. Please try signing out and signing back in.';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token has expired. Please re-authenticate.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format or Admin SDK not properly initialized. Check server logs.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'The ID token provided is invalid. This could be due to a malformed token, an issue with its signature, or a problem with the Admin SDK setup (e.g., service account key). Please check server logs for more details.';
    } else if (error.code && error.code.startsWith('auth/')) {
      errorMessage = `Authentication error: ${error.message} (Code: ${error.code}). Please try again.`;
    }
    
    return { isAdmin: false, error: errorMessage, status: 401 };
  }
}

