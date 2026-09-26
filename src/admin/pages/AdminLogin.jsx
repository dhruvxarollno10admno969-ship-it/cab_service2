import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
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

const ADMIN_EMAIL = "admin@gmail.com";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // ========================================
  // ADMIN LOGIN
  // ========================================

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

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // Only the admin email can access admin panel
      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);

        setError(
          "You are not authorized to access the admin panel."
        );

        return;
      }

      // Admin successfully logged in
      navigate("/admin");

    } catch (error) {
      console.error("Admin login error:", error);

      setError("Invalid email or password.");

    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // FORGOT PASSWORD
  // ========================================

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter your admin email first.");
      return;
    }

    // Only allow reset for admin email
    if (email !== ADMIN_EMAIL) {
      setError(
        "Password reset is only available for the admin account."
      );

      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(
        auth,
        email
      );

      setSuccess(
        "Password reset email has been sent."
      );

    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      setError(
        "Unable to send password reset email."
      );

    } finally {
      setResetLoading(false);
    }
  };


  return (
    <div className="admin-login-page">

      {/* ========================================
          BACKGROUND
      ======================================== */}

      <div className="admin-login-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>


      {/* ========================================
          LOGIN CARD
      ======================================== */}

      <div className="admin-login-card">


        {/* ========================================
            HEADER
        ======================================== */}

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


        {/* ========================================
            LOGIN FORM
        ======================================== */}

        <form onSubmit={handleLogin}>


          {/* ======================================
              EMAIL
          ====================================== */}

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
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>


          {/* ======================================
              PASSWORD
          ====================================== */}

          <div className="admin-input-group">

            <label htmlFor="admin-password">
              Password
            </label>


            {/* PASSWORD INPUT */}

            <div className="admin-input">

              <LockKeyhole size={18} />

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Admin password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />


              {/* SHOW / HIDE */}

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
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


          {/* ======================================
              ERROR
          ====================================== */}

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}


          {/* ======================================
              SUCCESS
          ====================================== */}

          {success && (
            <div className="admin-login-success">
              {success}
            </div>
          )}


          {/* ======================================
              LOGIN BUTTON
          ====================================== */}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Admin Sign In"}

            {!loading && (
              <ArrowRight size={18} />
            )}

          </button>

        </form>


        {/* ========================================
            BACK TO WEBSITE
        ======================================== */}

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