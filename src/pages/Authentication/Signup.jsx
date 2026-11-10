
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
    setError("");

    // Prevent accidental account switching.
    if (auth.currentUser) {
      setError("Please sign out of your current account first.");
      return;
    }

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      if (!customerSnapshot.exists()) {
        // Create a new customer profile.
        await setDoc(customerRef, {
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
        });
      }

      // New and incomplete customers must complete their profiles.
      const customerData = customerSnapshot.exists()
        ? customerSnapshot.data()
        : {
            name: user.displayName || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "India",
          };

      const requiredFields = [
        "name",
        "phone",
        "address",
        "city",
        "state",
        "country",
      ];

      const profileComplete = requiredFields.every((field) =>
        String(customerData[field] || "").trim()
      );

      if (profileComplete) {
        if (customerData.profileCompleted !== true) {
          await setDoc(
            customerRef,
            {
              profileCompleted: true,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        navigate("/", { replace: true });
      } else {
        await setDoc(
          customerRef,
          {
            profileCompleted: false,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        navigate("/complete-profile", { replace: true });
      }

    } catch (error) {
      console.error("Google signup error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google registration was cancelled.");
          break;

        case "auth/popup-blocked":
          setError("Your browser blocked the Google popup.");
          break;

        case "auth/unauthorized-domain":
          setError("This website domain is not authorized in Firebase.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;

        case "permission-denied":
        case "firestore/permission-denied":
          setError("Unable to save your customer profile. Check Firestore security rules.");
          break;

        default:
          setError(
            error.message || "Unable to complete Google registration."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

      <div className="signup-orb signup-orb-one" />
      <div className="signup-orb signup-orb-two" />
      <div className="signup-grid" />

      <header className="signup-topbar">
        <Link to="/" className="signup-back">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="signup-security">
          <ShieldCheck size={15} />
          Secure Registration
        </div>
      </header>

      <section className="signup-card">

        <div className="signup-heading">
          <div className="signup-eyebrow">
            <span />
            CREATE ACCOUNT
          </div>

          <h1>
            Start your
            <br />
            <em>journey.</em>
          </h1>

          <p>
            Create your account and get ready
            <br />
            for your next ride.
          </p>
        </div>

        <button
          type="button"
          className="signup-google-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="signup-google-loader" />
              <span>CONNECTING TO GOOGLE...</span>
            </>
          ) : (
            <>
              <svg
                className="signup-google-icon"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.6 5.9c4.43-4.09 7.16-10.11 7.16-17.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.5 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.6-5.9c-2.12 1.43-4.84 2.28-8.3 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>

              <span>Continue with Google</span>

              <ArrowUpRight
                className="signup-google-arrow"
                size={18}
              />
            </>
          )}
        </button>

        {error && (
          <div className="signup-error" role="alert">
            <span />
            {error}
          </div>
        )}

        <div className="signup-switch">
          <span>Already have an account?</span>

          <Link to="/login">
            Log in
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <p className="signup-legal">
          By creating an account, you agree to our
          {" "}<span>Terms</span> and{" "}
          <span>Privacy Policy</span>.
        </p>

      </section>

      <div className="signup-bottom">
        <span>MANZILL 777</span>
        <i />
        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </div>

    </main>
  );
}

export default Signup;
