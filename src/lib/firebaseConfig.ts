// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "AIzaSyCryN6VkAF6K7AL3ssJwakrEqm_K4VBK3Q",
  authDomain: "ac-warendorf-digital.firebaseapp.com",
  projectId: "ac-warendorf-digital",
  storageBucket: "ac-warendorf-digital.firebasestorage.app",
  messagingSenderId: "856092521846",
  appId: "1:856092521846:web:07db762d74ae7aa15df657"
};
// Initialize Firebase
// To avoid reinitializing the app on hot reloads, check if it's already initialized.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
