import { initializeFirestore, persistentLocalCache }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AIzaSyAPBbPaWzsBAeYF5WECBwFGKRDPebLQelg",
  projectId: "gym-2026",
  storageBucket: "gym-2026.firebasestorage.app",
  messagingSenderId: "630041280389",
  appId: "1:630041280389:web:315f54fd2ff81076900eec"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
