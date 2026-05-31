import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDY861H4S318Pd2dau8sK3kVzrsBsnYW8",
  authDomain: "homework54-c2911.firebaseapp.com",
  projectId: "homework54-c2911",
  storageBucket: "homework54-c2911.firebasestorage.app",
  messagingSenderId: "873005178306",
  appId: "1:873005178306:web:6c6c2aacd98cb7246f4a5b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);