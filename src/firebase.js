
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAsqgJf0kW4MazDqT5hw_0AWocUsH7gZW8",
  authDomain: "cab-booking-8c616.firebaseapp.com",
  projectId: "cab-booking-8c616",
  storageBucket: "cab-booking-8c616.firebasestorage.app",
  messagingSenderId: "959725155929",
  appId: "1:959725155929:web:24805628ae041d91a7a348",
  measurementId: "G-H42S14Y6JT",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize App Check only when a site key is configured.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (import.meta.env.DEV) {
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;

  if (debugToken) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  } else if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  } else {
    console.warn(
      "App Check needs VITE_FIREBASE_APPCHECK_DEBUG_TOKEN on this browser. " +
        "Set a debug token and register it in Firebase Console."
    );
  }
}

export const appCheck = recaptchaSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  : null;

export const functions = getFunctions(app);
