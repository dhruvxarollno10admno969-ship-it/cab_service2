
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
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");

    // Prevent accidental switching from an existing admin/customer session.
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

      let customerData;

      if (!customerSnapshot.exists()) {
        // Create a new customer record.
        customerData = {
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

        await setDoc(customerRef, customerData);
      } else {
        customerData = customerSnapshot.data();
      }

      // Check all mandatory profile fields.
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
        // Support existing customer records created before this update.
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
        // Mandatory profile completion.
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
      console.error("Google login error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-in was cancelled.");
          break;

        case "auth/popup-blocked":
          setError("Please allow popups and try again.");
          break;

        case "auth/unauthorized-domain":
          setError("This domain is not authorized in Firebase.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;

        case "permission-denied":
        case "firestore/permission-denied":
          setError("Unable to access your customer profile. Check Firestore security rules.");
          break;

        default:
          setError(error.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-grid" />
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <header className="login-topbar">
        <Link to="/" className="login-back">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="login-security">
          <ShieldCheck size={15} />
          Secure Login
        </div>
      </header>

      <section className="login-card">

        <div className="login-heading">
          <div className="login-eyebrow">
            <span />
            WELCOME BACK
          </div>

          <h1>
            Ready to
            <br />
            <em>ride?</em>
          </h1>

          <p>
            Sign in to your account and continue
            <br />
            your journey with MANZILL 777.
          </p>
        </div>

        <button
          type="button"
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="login-google-loader" />
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
          )}

          <span>
            {loading
              ? "CONNECTING TO GOOGLE..."
              : "Continue with Google"}
          </span>

          {!loading && (
            <ArrowUpRight
              className="login-google-arrow"
              size={18}
            />
          )}
        </button>

        {error && (
          <div className="login-error" role="alert">
            <span />
            {error}
          </div>
        )}

        <div className="login-switch">
          <span>Don't have an account?</span>

          <Link to="/signup">
            Create account
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <p className="login-legal">
          By continuing, you agree to our
          {" "}<span>Terms</span> and{" "}
          <span>Privacy Policy</span>.
        </p>

      </section>

      <div className="login-bottom">
        <span>MANZILL 777</span>
        <i />
        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </div>

    </main>
  );
}

export default Login;
