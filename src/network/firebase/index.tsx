import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqs-YbBA7VYkceU6rH_iyNp84e-kXPis8",
  authDomain: "b-mart-009.firebaseapp.com",
  projectId: "b-mart-009",
  storageBucket: "b-mart-009.firebasestorage.app",
  messagingSenderId: "214477066669",
  appId: "1:214477066669:web:957d9480b706fe34fbd124",
  measurementId: "G-03LW1GQR01",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
