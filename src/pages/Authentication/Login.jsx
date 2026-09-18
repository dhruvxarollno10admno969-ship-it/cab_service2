import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        password,
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
          setError("Network error. Please check your connection.");
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* ================= BACKGROUND ================= */}

      <div className="login-grid" />

      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      {/* ================= TOP BAR ================= */}

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

      {/* ================= CARD ================= */}

      <section className="login-card">
        {/* LOGO */}

        <Link to="/" className="login-logo">
          <span className="login-logo-mark">M</span>

          <span className="login-logo-text">
            MANZILL <strong>777</strong>
          </span>
        </Link>

        {/* HEADING */}

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

        {/* FORM */}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* EMAIL */}

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

          {/* PASSWORD */}

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

          {/* ERROR */}

          {error && (
            <div className="login-error">
              <span />
              {error}
            </div>
          )}

          {/* BUTTON */}

          <button type="submit" className="login-button" disabled={loading}>
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

        {/* REGISTER */}

        <div className="login-switch">
          <span>Don't have an account?</span>

          <Link to="/signup">
            Create account
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* LEGAL */}

        <p className="login-legal">
          By continuing, you agree to our <span>Terms</span> and{" "}
          <span>Privacy Policy</span>.
        </p>
      </section>

      {/* ================= BOTTOM BRAND ================= */}

      <div className="login-bottom">
        <span>MANZILL 777</span>

        <i />

        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </div>
    </main>
  );
}

export default Login;
