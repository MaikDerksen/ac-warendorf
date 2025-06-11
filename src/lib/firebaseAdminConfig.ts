
import admin from 'firebase-admin';

// Ensure that environment variables are loaded. For Next.js, .env.local is loaded automatically.
// For other environments, you might need a package like `dotenv`.

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace literal \n with actual newlines
};

let adminApp: admin.app.App;

if (!admin.apps.length) {
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // Add your storageBucket URL if you interact with Storage via Admin SDK,
      // though for presigned URLs or client-side uploads, it's not always needed here.
      // storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
    console.log('Firebase Admin SDK Initialized.');
  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    // Depending on your error handling strategy, you might throw the error
    // or handle it gracefully. For API routes, this might mean they can't function.
    // throw error;
  }
} else {
  adminApp = admin.app();
  console.log('Firebase Admin SDK already initialized.');
}

// Ensure adminApp is defined before exporting.
// If initialization fails, adminApp might be undefined.
// This basic check doesn't fully cover all error scenarios but is a start.
if (!adminApp!) {
    console.error("CRITICAL: Firebase Admin App could not be initialized. API routes requiring admin auth will fail.");
    // Potentially throw an error or use a default mock/dummy app if that makes sense for your error strategy
    // For now, we'll let it be undefined, and checks in API routes will handle it.
}


export { adminApp }; // Export the initialized admin app
