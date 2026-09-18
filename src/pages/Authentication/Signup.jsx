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
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../firebase";

import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name.trim(),
      });

      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setError("Password is too weak.");
          break;

        default:
          setError(
            "Something went wrong. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

      {/* ================= BACKGROUND ================= */}

      <div className="signup-orb signup-orb-one" />
      <div className="signup-orb signup-orb-two" />

      <div className="signup-grid" />


      {/* ================= TOP BAR ================= */}

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


      {/* ================= MAIN CARD ================= */}

      <section className="signup-card">

        {/* LOGO */}

        <Link to="/" className="signup-logo">

          <span className="signup-logo-mark">
            M
          </span>

          <span className="signup-logo-text">
            MANZILL <strong>777</strong>
          </span>

        </Link>


        {/* HEADING */}

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


        {/* FORM */}

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <label className="signup-field">

            <span>FULL NAME</span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your full name"
              autoComplete="name"
              required
            />

          </label>


          {/* EMAIL */}

          <label className="signup-field">

            <span>EMAIL ADDRESS</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

          </label>


          {/* PASSWORD ROW */}

          <div className="signup-password-row">

            {/* PASSWORD */}

            <label className="signup-field">

              <span>PASSWORD</span>

              <div className="signup-input-wrap">

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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="signup-eye"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </label>


            {/* CONFIRM PASSWORD */}

            <label className="signup-field">

              <span>CONFIRM PASSWORD</span>

              <div className="signup-input-wrap">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="signup-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </label>

          </div>


          {/* PASSWORD STATUS */}

          {password && (
            <div
              className={
                password.length >= 6
                  ? "password-status valid"
                  : "password-status"
              }
            >
              <span />
              {password.length >= 6
                ? "Password meets the minimum requirement"
                : "Password must contain at least 6 characters"}
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="signup-error">
              <span />
              {error}
            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >

            <span>
              {loading
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </span>

            {loading ? (
              <span className="signup-loader" />
            ) : (
              <span className="signup-button-icon">
                <ArrowUpRight size={18} />
              </span>
            )}

          </button>

        </form>


        {/* LOGIN */}

        <div className="signup-switch">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Log in
            <ArrowUpRight size={14} />
          </Link>

        </div>


        {/* LEGAL */}

        <p className="signup-legal">
          By creating an account, you agree to our{" "}
          <span>Terms</span> and{" "}
          <span>Privacy Policy</span>.
        </p>

      </section>


      {/* ================= BOTTOM BRAND ================= */}

      <div className="signup-bottom">

        <span>MANZILL 777</span>

        <i />

        <span>
          PREMIUM TRAVEL EXPERIENCE
        </span>

      </div>

    </main>
  );
}

export default Signup;