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
  deleteUser,
  signOut,
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
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

      // Reject new accounts from the Login page.
      if (additionalInfo?.isNewUser) {
        try {
          await deleteUser(user);
        } catch (deleteError) {
          console.error("New account cleanup failed:", deleteError);

          // Make sure the user is signed out even if deletion fails.
          await signOut(auth).catch((signOutError) => {
            console.error("Sign out failed:", signOutError);
          });

          setError(
            "No existing account was found. Please sign up first. The temporary account could not be removed automatically."
          );

          return;
        }

        setError("No account found. Please sign up first.");
        return;
      }

      // Get the customer's Firestore profile.
      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      let customerData;

      // Repair a missing customer profile for an existing Auth account.
      if (!customerSnapshot.exists()) {
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

        customerData = newCustomer;
      } else {
        customerData = customerSnapshot.data();
      }

      // Check whether the customer profile is complete.
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
          typeof customerData[field] === "string" &&
          customerData[field].trim() !== ""
        );
      });

      // Update profile completion status.
      if (customerData.profileCompleted !== isProfileComplete) {
        await setDoc(
          customerRef,
          {
            profileCompleted: isProfileComplete,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      if (isProfileComplete) {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }
    } catch (error) {
      console.error("Google login error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-in was cancelled.");
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

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        default:
          setError("Unable to log in. Please try again.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-one"></div>
      <div className="login-orb login-orb-two"></div>
      <div className="login-grid"></div>

      <div className="login-topbar">
        <Link to="/" className="login-back">
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>

        <Link to="/" className="login-brand">
          <span className="login-brand-mark">M</span>
          <span>MANZILL <strong>777</strong></span>
        </Link>
      </div>

      <div className="login-card">
        <div className="login-card-icon">
          <ShieldCheck size={25} />
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">
            WELCOME BACK
          </span>

          <h1>
            Your journey
            <br />
            <span>starts here.</span>
          </h1>

          <p>
            Sign in to your MANZILL 777 account and continue
            your journey with us.
          </p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="login-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="login-loader"></span>
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
            {loading ? "Signing in..." : "Continue with Google"}
          </span>

          {!loading && <ArrowUpRight size={18} />}
        </button>

        <div className="login-switch">
          <span>Don't have an account?</span>
          <Link to="/signup">
            Create account
          </Link>
        </div>

        <div className="login-legal">
          By continuing, you agree to our
          <Link to="/terms"> Terms of Service </Link>
          and
          <Link to="/privacy"> Privacy Policy</Link>.
        </div>
      </div>

      <div className="login-bottom">
        <span>MANZILL 777</span>
        <span>PREMIUM CAB SERVICES</span>
      </div>
    </div>
  );
}

export default Login;