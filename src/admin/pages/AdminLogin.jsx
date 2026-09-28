import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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

const ADMIN_EMAIL = "admin@gmail.com";


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

  const [resetLoading, setResetLoading] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);


  // =====================================================
  // CHECK EXISTING FIREBASE LOGIN
  // =====================================================

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {

        // -----------------------------------------------
        // ADMIN ALREADY LOGGED IN
        // -----------------------------------------------

        if (
          currentUser &&
          currentUser.email === ADMIN_EMAIL
        ) {

          navigate("/admin", {
            replace: true,
          });

          return;
        }


        // -----------------------------------------------
        // CUSTOMER LOGGED IN
        //
        // Customer is NOT allowed into admin panel.
        // We simply keep them on admin login page.
        // -----------------------------------------------

        setCheckingAuth(false);
      }
    );


    return () => unsubscribe();

  }, [navigate]);


  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();


    setError("");

    setSuccess("");


    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!email || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      // -------------------------------------------------
      // FIREBASE LOGIN
      // -------------------------------------------------

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user = userCredential.user;


      // -------------------------------------------------
      // ADMIN EMAIL CHECK
      // -------------------------------------------------

      if (user.email !== ADMIN_EMAIL) {

        await signOut(auth);


        setError(
          "You are not authorized to access the admin panel."
        );


        return;
      }


      // -------------------------------------------------
      // ADMIN VERIFIED
      // -------------------------------------------------

      navigate("/admin", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Admin login error:",
        error
      );


      // Firebase errors

      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        setError(
          "Invalid admin email or password."
        );

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        setError(
          "Admin account does not exist."
        );

      } else if (
        error.code ===
        "auth/wrong-password"
      ) {

        setError(
          "Incorrect admin password."
        );

      } else {

        setError(
          "Unable to login. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {

    setError("");

    setSuccess("");


    // ---------------------------------------------------
    // EMAIL REQUIRED
    // ---------------------------------------------------

    if (!email) {

      setError(
        "Enter your admin email first."
      );

      return;
    }


    // ---------------------------------------------------
    // ONLY ADMIN EMAIL
    // ---------------------------------------------------

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


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="admin-login-bg">

        <span></span>

        <span></span>

        <span></span>

      </div>


      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="admin-login-card">


        {/* =================================================
            HEADER
        ================================================= */}

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


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form onSubmit={handleLogin}>


          {/* =================================================
              EMAIL
          ================================================= */}

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


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="admin-input-group">

            <label htmlFor="admin-password">
              Password
            </label>


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


              {/* SHOW / HIDE PASSWORD */}

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


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="admin-login-error">
              {error}
            </div>

          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (

            <div className="admin-login-success">
              {success}
            </div>

          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

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


        {/* =================================================
            BACK TO WEBSITE
        ================================================= */}

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