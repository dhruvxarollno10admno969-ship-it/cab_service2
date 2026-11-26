
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";

import { getFunctions } from "firebase/functions";

// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyAsqgJf0kW4MazDqT5hw_0AWocUsH7gZW8",
  authDomain: "cab-booking-8c616.firebaseapp.com",
  projectId: "cab-booking-8c616",
  storageBucket: "cab-booking-8c616.firebasestorage.app",
  messagingSenderId: "959725155929",
  appId: "1:959725155929:web:24805628ae041d91a7a348",
  measurementId: "G-H42S14Y6JT",
};

// ========================================
// INITIALIZE FIREBASE
// ========================================

export const app = initializeApp(firebaseConfig);

// ========================================
// FIREBASE APP CHECK
// ========================================

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!recaptchaSiteKey) {
  throw new Error(
    "Missing VITE_RECAPTCHA_SITE_KEY in your .env file."
  );
}

// Enable App Check debug mode during development.
if (import.meta.env.DEV) {
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;

  self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken || true;
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});

// ========================================
// FIREBASE SERVICES
// ========================================

export const auth = getAuth(app);
export const db = getFirestore(app);

// ========================================
// FIREBASE CLOUD FUNCTIONS
// ========================================

export const functions = getFunctions(app, "us-central1");
