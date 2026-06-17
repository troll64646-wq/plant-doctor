import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUbdRp9MHBrvOP33ECRz4xdl4ncpm8cpc",
  authDomain: "plant-doctor-225e3.firebaseapp.com",
  projectId: "plant-doctor-225e3",
  storageBucket: "plant-doctor-225e3.firebasestorage.app",
  messagingSenderId: "300741204244",
  appId: "1:300741204244:web:0b3ffc2356ceedbca58a01",
  measurementId: "G-6YENC8PF6P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
