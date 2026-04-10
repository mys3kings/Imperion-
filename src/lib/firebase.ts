import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDGyXvuNGlS-DfoCHy6_gNUudbAzkowStY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "imperion-4abfe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "imperion-4abfe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "imperion-4abfe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "533125885364",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:533125885364:web:6426956f6dd8942c6c56e1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
