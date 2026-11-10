
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../../firebase";

import {
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import "../styles/adminLogin.css";

// =====================================================
// ADMIN EMAIL
// =====================================================

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const AdminLogin = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // =====================================================
  // CHECK EXISTING FIREBASE LOGIN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // ADMIN EMAIL/PASSWORD LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);

        setError(
          "You are not authorized to access the admin panel."
        );

        return;
      }

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin login error:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid admin email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("Admin account does not exist.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect admin password.");
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE SSO LOGIN
  // =====================================================

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      setGoogleLoading(true);

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      // Only the authorized admin email is allowed.

      if (
        user.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        setError(
          "This Google account is not authorized to access the admin panel."
        );

        return;
      }

      navigate("/admin", {
        replace: true,
      });
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

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter your admin email first.");
      return;
    }

    if (email !== ADMIN_EMAIL) {
      setError(
        "Password reset is only available for the admin account."
      );
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, email);

      setSuccess("Password reset email has been sent.");
    } catch (error) {
      console.error("Password reset error:", error);

      setError("Unable to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  // =====================================================
  // CHECKING AUTH
  // =====================================================

  if (checkingAuth) {
    return (
      <div className="admin-auth-loading">
        Checking admin access...
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

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
            Sign in to access the admin panel.
          </p>

        </div>

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="admin-input-group">

            <label htmlFor="admin-email">
              Email Address
            </label>

            <div className="admin-input">

              <Mail size={18} />

              <input
                id="admin-email"
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="admin-input-group">

            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-input">

              <LockKeyhole size={18} />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              {/* SHOW / HIDE PASSWORD */}

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* FORGOT PASSWORD */}

            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading
                ? "Sending..."
                : "Forgot password?"}
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="admin-login-success">
              {success}
            </div>
          )}

          {/* EMAIL LOGIN BUTTON */}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || googleLoading}
          >
            {loading ? "Signing in..." : "Admin Sign In"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        {/* GOOGLE SSO BUTTON */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: "100%",
            height: "54px",
            marginTop: "14px",
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
            cursor:
              googleLoading || loading
                ? "not-allowed"
                : "pointer",
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
