import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

import "../App.css";
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

    // Check passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Get Firebase user
      const user = userCredential.user;

      // Save user's name in Firebase profile
      await updateProfile(user, {
        displayName: name,
      });

      // Go to home page
      navigate("/");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email."
          );
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password is too weak.");
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* BACK */}

        <Link to="/" className="auth-back">
          <ArrowLeft size={17} />
          Back to Home
        </Link>


        {/* LOGO */}

        <Link to="/" className="auth-logo">
          <span className="logo-mark">
            M
          </span>

          <span>
            MANZILL 777
          </span>
        </Link>


        {/* HEADING */}

        <div className="auth-heading">

          <p className="eyebrow">
            <span></span>
            CREATE ACCOUNT
          </p>

          <h1>
            Join the
            <br />
            <span>journey.</span>
          </h1>

          <p>
            Create your account to book
            and manage your rides.
          </p>

        </div>


        {/* FORM */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <label>
            <span>NAME</span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your full name"
              required
            />
          </label>


          {/* EMAIL */}

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


          {/* PASSWORD */}

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
                placeholder="Minimum 6 characters"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
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
          </label>


          {/* CONFIRM PASSWORD */}

          <label>
            <span>CONFIRM PASSWORD</span>

            <div className="password-input">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Repeat your password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </label>


          {/* ERROR */}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          {/* BUTTON */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && <ArrowUpRight size={18} />}
          </button>

        </form>


        {/* LOGIN LINK */}

        <p className="auth-switch">
          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Signup;