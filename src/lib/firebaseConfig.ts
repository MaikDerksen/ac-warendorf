
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Ensure this is your actual Firebase project configuration!
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Explicitly check for critical Firebase configuration values
if (!firebaseConfig.projectId) {
  console.error(
    "CRITICAL Firebase Config Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or undefined. " +
    "Please ensure it is correctly set in your .env.local file and that you have " +
    "restarted your Next.js development server. Firebase cannot initialize without a Project ID."
  );
}
if (!firebaseConfig.apiKey) {
  console.warn(
    "Firebase Config Warning: NEXT_PUBLIC_FIREBASE_API_KEY is missing or undefined. " +
    "This is required for Firebase services to function correctly. Please check your .env.local file."
  );
}

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let auth: Auth | undefined;

// Only attempt to initialize if critical configurations are present
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
    }
  } catch (error) {
    console.error("Error during Firebase initialization:", error);
    // Ensure services are undefined if initialization fails
    app = undefined;
    db = undefined;
    storage = undefined;
    auth = undefined;
  }
} else {
  console.error(
    "Firebase initialization skipped due to missing critical configuration (projectId or apiKey). " +
    "Firebase services (Firestore, Storage, Auth) will not be available. " +
    "Please check your .env.local file and restart the server."
  );
}

export { app, db, storage, auth };
