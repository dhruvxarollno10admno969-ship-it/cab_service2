
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../../firebase";

import {
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

import "../styles/adminlogin.css";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const AdminLogin = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check existing Firebase login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (
        currentUser &&
        currentUser.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()
      ) {
        navigate("/admin", { replace: true });
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Google SSO login
  const handleGoogleLogin = async () => {
    if (googleLoading) return;

    setError("");

    try {
      setGoogleLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (
        user.email?.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()
      ) {
        await signOut(auth);

        setError(
          "This Google account is not authorized to access the admin panel."
        );

        return;
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Google admin login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Google sign-in popup was blocked by your browser.");
      } else if (error.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized in Firebase Authentication."
        );
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="admin-auth-loading">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="admin-login-page">

      {/* BACKGROUND */}
      <div className="admin-login-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* LOGIN CARD */}
      <div className="admin-login-card">

        {/* HEADER */}
        <div className="admin-login-header">

          <div className="admin-lock">
            <LockKeyhole size={24} />
          </div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Welcome <span>Back.</span>
          </h1>

          <p className="admin-subtitle">
            Sign in securely with your authorized Google account.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        {/* GOOGLE SSO */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: "100%",
            height: "54px",
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            background: "#151515",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: 600,
            cursor: googleLoading ? "not-allowed" : "pointer",
            opacity: googleLoading ? 0.6 : 1,
            transition: "background 0.2s ease",
          }}
        >
          {googleLoading ? (
            "Connecting to Google..."
          ) : (
            <>
              <svg
                width="19"
                height="19"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.8 11.8 0 0 1 7.6 2.7l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.3 14.7 6.6 4.8A12 12 0 0 1 31.6 14l5.7-5.7A20 20 0 0 0 6.3 14.7Z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44a20 20 0 0 0 13.3-5.1l-6.2-5.2A12 12 0 0 1 12.8 28l-6.5 5A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.2 5.7l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.3-.4-3.5Z"
                />
              </svg>

              Continue with Google

              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* BACK TO WEBSITE */}
        <button
          type="button"
          className="back-to-website"
          onClick={() => navigate("/")}
        >
          ← Back to website
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;
