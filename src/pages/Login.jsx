import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Temporary frontend login
    console.log({
      email,
      password,
    });

    navigate("/");
  };

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* BACK TO HOME */}

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


        {/* LOGIN FORM */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

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
                placeholder="Your password"
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


          {/* ERROR */}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-button"
          >
            Sign In
            <ArrowUpRight size={18} />
          </button>

        </form>


        {/* SIGNUP */}

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