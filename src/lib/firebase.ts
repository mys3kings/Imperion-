import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGyXvuNGlS-DfoCHy6_gNUudbAzkowStY",
  authDomain: "imperion-4abfe.firebaseapp.com",
  projectId: "imperion-4abfe",
  storageBucket: "imperion-4abfe.firebasestorage.app",
  messagingSenderId: "533125885364",
  appId: "1:533125885364:web:6426956f6dd8942c6c56e1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
