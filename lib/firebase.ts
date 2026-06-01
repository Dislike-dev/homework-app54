import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAt0pNvCIHH4kZKqJWkXdK6viPmb-GthyQ",
  authDomain: "homework-app-e9071.firebaseapp.com",
  projectId: "homework-app-e9071",
  storageBucket: "homework-app-e9071.firebasestorage.app",
  messagingSenderId: "265171779251",
  appId: "1:265171779251:web:2c75ba4017c3b1c18cbac6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);