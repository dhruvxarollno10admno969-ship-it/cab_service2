import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ========================================
  // EMAIL / PASSWORD LOGIN
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("Logged in user:", userCredential.user);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GOOGLE SIGN IN
  // ========================================

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check whether the customer profile already exists.
      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      // Create a profile only if one does not already exist.
      if (!customerSnapshot.exists()) {
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      console.log("Google login successful:", user);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-in was cancelled.");
          break;

        case "auth/popup-blocked":
          setError("Please allow popups for this website and try again.");
          break;

        case "auth/account-exists-with-different-credential":
          setError(
            "An account already exists with this email using another login method. Sign in with that method first."
          );
          break;

        case "auth/unauthorized-domain":
          setError(
            "This website domain is not authorized in Firebase Authentication."
          );
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        default:
          setError(error.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* BACKGROUND */}

      <div className="login-grid" />
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      {/* TOP BAR */}

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

      {/* LOGIN CARD */}

      <section className="login-card">
        <Link to="/" className="login-logo">
          <span className="login-logo-mark">M</span>

          <span className="login-logo-text">
            MANZILL <strong>777</strong>
          </span>
        </Link>

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

        {/* EMAIL LOGIN */}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>EMAIL ADDRESS</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="login-field">
            <div className="login-field-header">
              <span>PASSWORD</span>

              <button
                type="button"
                className="login-forgot"
                onClick={() =>
                  setError("Password reset can be added with Firebase.")
                }
              >
                Forgot password?
              </button>
            </div>

            <div className="login-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error">
              <span />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || googleLoading}
          >
            <span>{loading ? "SIGNING IN..." : "SIGN IN"}</span>

            {loading ? (
              <span className="login-loader" />
            ) : (
              <span className="login-button-icon">
                <ArrowUpRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* DIVIDER */}

        <div className="login-divider">
          <span />
          <small>OR CONTINUE WITH</small>
          <span />
        </div>

        {/* GOOGLE LOGIN */}

        <button
          type="button"
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
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
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
          )}

          <span>
            {googleLoading ? "CONNECTING TO GOOGLE..." : "Continue with Google"}
          </span>
        </button>

        {/* REGISTER */}

        <div className="login-switch">
          <span>Don't have an account?</span>

          <Link to="/signup">
            Create account
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <p className="login-legal">
          By continuing, you agree to our <span>Terms</span> and{" "}
          <span>Privacy Policy</span>.
        </p>
      </section>

      {/* BOTTOM BRAND */}

      <div className="login-bottom">
        <span>MANZILL 777</span>
        <i />
        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </div>
    </main>
  );
}

export default Login;
