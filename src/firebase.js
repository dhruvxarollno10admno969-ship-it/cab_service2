import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsqgJf0kW4MazDqT5hw_0AWocUsH7gZW8",
  authDomain: "cab-booking-8c616.firebaseapp.com",
  projectId: "cab-booking-8c616",
  storageBucket: "cab-booking-8c616.firebasestorage.app",
  messagingSenderId: "959725155929",
  appId: "1:959725155929:web:24805628ae041d91a7a348",
  measurementId: "G-H42S14Y6JT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);