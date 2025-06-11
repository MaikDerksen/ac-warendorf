
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: Ensure this is your actual Firebase project configuration!
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCryN6VkAF6K7AL3ssJwakrEqm_K4VBK3Q", // Replace with your actual apiKey
  authDomain: "ac-warendorf-digital.firebaseapp.com", // Replace with your actual authDomain
  projectId: "ac-warendorf-digital", // Replace with your actual projectId
  storageBucket: "ac-warendorf-digital.appspot.com", // Replace with your actual storageBucket
  messagingSenderId: "856092521846", // Replace with your actual messagingSenderId
  appId: "1:856092521846:web:07db762d74ae7aa15df657" // Replace with your actual appId
};

// Initialize Firebase
// To avoid reinitializing the app on hot reloads, check if it's already initialized.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
