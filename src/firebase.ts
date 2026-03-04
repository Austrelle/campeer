
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBnf9PF26ZFBy2164VcFZvS59LvWNVVaX0",
  authDomain: "campeer-jrmsu.firebaseapp.com",
  projectId: "campeer-jrmsu",
  storageBucket: "campeer-jrmsu.firebasestorage.app",
  messagingSenderId: "417601010803",
  appId: "1:417601010803:web:7dc2b35898b251d3513e06"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
