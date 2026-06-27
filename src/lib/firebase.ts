import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration obtained from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyA0YGPQ6Pxb5fcCt6tms3E1xWFsj-bQfVc",
  authDomain: "gen-lang-client-0784135276.firebaseapp.com",
  projectId: "gen-lang-client-0784135276",
  storageBucket: "gen-lang-client-0784135276.firebasestorage.app",
  messagingSenderId: "705958641696",
  appId: "1:705958641696:web:80110662dd40506b663c45"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore using the custom database ID from the config
export const db = getFirestore(app, "ai-studio-4234fb6b-9c6f-46af-8de1-459965efb882");

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
