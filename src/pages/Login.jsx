import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import "../App.css";

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

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Logged in user:", userCredential.user);

    navigate("/");
  } catch (error) {
    console.error("Login error:", error);

    if (error.code === "auth/invalid-credential") {
      setError("Invalid email or password.");
    } else if (error.code === "auth/user-not-found") {
      setError("No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
      setError("Incorrect password.");
    } else {
      setError("Login failed. Please try again.");
    }
  }
};

  return (
    <main className="auth-page">

      <div className="auth-card">

        <Link to="/" className="auth-back">
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <Link to="/" className="auth-logo">
          <span className="logo-mark">
            M
          </span>

          <span>
            MANZILL 777
          </span>
        </Link>

        <div className="auth-heading">

          <p className="eyebrow">
            <span></span>
            WELCOME BACK
          </p>

          <h1>
            Ready to
            <br />
            <span>ride?</span>
          </h1>

          <p>
            Sign in to continue booking
            your next journey.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>
            <span>EMAIL</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span>PASSWORD</span>

            <div className="password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}

            {!loading && (
              <ArrowUpRight size={18} />
            )}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}

          <Link to="/signup">
            Create account
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Login;