import { useState } from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import {
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignup = async () => {
    if (loading) return;

    setError("");

    if (auth.currentUser) {
      setError("Please sign out of your current account first.");
      return;
    }

    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // Only allow newly created Firebase Auth accounts.
      if (!additionalInfo || !additionalInfo.isNewUser) {
        await signOut(auth);

        setError(
          "An account with this Google account already exists. Please log in instead."
        );

        return;
      }

      // Create a new customer profile.
      const customerRef = doc(db, "customers", user.uid);

      const customerSnapshot = await getDoc(customerRef);

      // A new Auth user should not already have a customer profile.
      if (customerSnapshot.exists()) {
        await signOut(auth);

        setError(
          "An account with this Google account already exists. Please log in instead."
        );

        return;
      }

      const newCustomer = {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        role: "customer",
        emailVerified: user.emailVerified,
        authProvider: "google",
        profileCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(customerRef, newCustomer);

      // Check whether the profile is complete.
      const requiredFields = [
        "name",
        "phone",
        "address",
        "city",
        "state",
        "country",
      ];

      const isProfileComplete = requiredFields.every((field) => {
        return (
          typeof newCustomer[field] === "string" &&
          newCustomer[field].trim() !== ""
        );
      });

      await setDoc(
        customerRef,
        {
          profileCompleted: isProfileComplete,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (isProfileComplete) {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }
    } catch (error) {
      console.error("Google signup error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-up was cancelled.");
          break;

        case "auth/popup-blocked":
          setError("Your browser blocked the Google sign-in popup.");
          break;

        case "auth/cancelled-popup-request":
          setError("A Google sign-in request is already in progress.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        case "permission-denied":
        case "firestore/permission-denied":
          setError("Permission denied. Please contact support.");
          break;

        case "auth/email-already-in-use":
          setError("This account already exists. Please log in.");
          break;

        default:
          setError("Unable to create your account. Please try again.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-orb signup-orb-one"></div>
      <div className="signup-orb signup-orb-two"></div>
      <div className="signup-grid"></div>

      <div className="signup-topbar">
        <Link to="/" className="signup-back">
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>

        <Link to="/" className="signup-brand">
          <span className="signup-brand-mark">M</span>
          <span>MANZILL <strong>777</strong></span>
        </Link>
      </div>

      <div className="signup-card">
        <div className="signup-card-icon">
          <ShieldCheck size={25} />
        </div>

        <div className="signup-heading">
          <span className="signup-eyebrow">
            GET STARTED
          </span>

          <h1>
            Your next
            <br />
            <span>ride awaits.</span>
          </h1>

          <p>
            Create your MANZILL 777 account and experience
            a better way to travel.
          </p>
        </div>

        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="signup-google-btn"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <span className="signup-loader"></span>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.35 5.7c4.29-3.96 7.41-9.8 7.41-17.35z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59A14.5 14.5 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.47 0 11.91-2.13 15.88-5.8l-7.35-5.7c-2.04 1.37-4.65 2.18-8.53 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          )}

          <span>
            {loading ? "Creating account..." : "Sign up with Google"}
          </span>

          {!loading && <ArrowUpRight size={18} />}
        </button>

        <div className="signup-switch">
          <span>Already have an account?</span>
          <Link to="/login">
            Log in
          </Link>
        </div>

        <div className="signup-legal">
          By continuing, you agree to our
          <Link to="/terms"> Terms of Service </Link>
          and
          <Link to="/privacy"> Privacy Policy</Link>.
        </div>
      </div>

      <div className="signup-bottom">
        <span>MANZILL 777</span>
        <span>PREMIUM CAB SERVICES</span>
      </div>
    </div>
  );
}

export default Signup;