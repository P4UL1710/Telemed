// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQwapWcU2z3vteA6kzBnnnihUNWsa9Bb0",
  authDomain: "telemed-7674f.firebaseapp.com",
  projectId: "telemed-7674f",
  storageBucket: "telemed-7674f.firebasestorage.app",
  messagingSenderId: "501514912985",
  appId: "1:501514912985:web:cde623ff55dc0507ba2ac8",
  measurementId: "G-076BDZQ039"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;