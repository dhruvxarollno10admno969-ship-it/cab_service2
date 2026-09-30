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

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./signup.css";


function Signup() {

  const navigate = useNavigate();


  // ========================================
  // FORM STATE
  // ========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [city, setCity] = useState("");

  const [state, setState] = useState("");

  const [country, setCountry] = useState("India");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  // ========================================
  // UI STATE
  // ========================================

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  // ========================================
  // SIGNUP
  // ========================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");


    // ======================================
    // VALIDATION
    // ======================================

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }


    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }


    if (!phone.trim()) {
      setError("Please enter your phone number.");
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
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }


    try {

      setLoading(true);


      // ======================================
      // 1. CREATE FIREBASE AUTH ACCOUNT
      // ======================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );


      const user = userCredential.user;


      // ======================================
      // 2. UPDATE FIREBASE AUTH PROFILE
      // ======================================

      await updateProfile(user, {
        displayName: name.trim(),
      });


      // ======================================
      // 3. CREATE CUSTOMER DOCUMENT
      // ======================================

      await setDoc(
        doc(db, "customers", user.uid),
        {

          uid: user.uid,

          name: name.trim(),

          email: user.email,

          phone: phone.trim(),

          address: address.trim(),

          city: city.trim(),

          state: state.trim(),

          country: country.trim(),

          role: "customer",

          createdAt: serverTimestamp(),

          updatedAt: serverTimestamp(),

        }
      );


      // ======================================
      // 4. SUCCESS
      // ======================================

      navigate("/");

    } catch (error) {

      console.error(
        "Signup error:",
        error
      );


      // ======================================
      // AUTH ERRORS
      // ======================================

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

          setError(
            "Password is too weak."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network error. Please check your internet connection."
          );

          break;


        default:

          setError(
            "Unable to create account. Please try again."
          );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <main className="signup-page">


      {/* ========================================
          BACKGROUND
      ======================================== */}

      <div className="signup-orb signup-orb-one" />

      <div className="signup-orb signup-orb-two" />

      <div className="signup-grid" />


      {/* ========================================
          TOP BAR
      ======================================== */}

      <header className="signup-topbar">

        <Link
          to="/"
          className="signup-back"
        >

          <ArrowLeft size={16} />

          <span>
            Back to Home
          </span>

        </Link>


        <div className="signup-security">

          <ShieldCheck size={15} />

          Secure Registration

        </div>

      </header>


      {/* ========================================
          MAIN CARD
      ======================================== */}

      <section className="signup-card">


        {/* LOGO */}

        <Link
          to="/"
          className="signup-logo"
        >

          <span className="signup-logo-mark">
            M
          </span>


          <span className="signup-logo-text">

            MANZILL{" "}

            <strong>
              777
            </strong>

          </span>

        </Link>


        {/* ========================================
            HEADING
        ======================================== */}

        <div className="signup-heading">

          <div className="signup-eyebrow">

            <span />

            CREATE ACCOUNT

          </div>


          <h1>

            Start your

            <br />

            <em>
              journey.
            </em>

          </h1>


          <p>

            Create your account and get ready

            <br />

            for your next ride.

          </p>

        </div>


        {/* ========================================
            FORM
        ======================================== */}

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >


          {/* ======================================
              NAME
          ====================================== */}

          <label className="signup-field">

            <span>
              FULL NAME
            </span>


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


          {/* ======================================
              EMAIL
          ====================================== */}

          <label className="signup-field">

            <span>
              EMAIL ADDRESS
            </span>


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


          {/* ======================================
              PHONE
          ====================================== */}

          <label className="signup-field">

            <span>
              PHONE NUMBER
            </span>


            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="+91 98765 43210"
              autoComplete="tel"
              required
            />

          </label>


          {/* ======================================
              ADDRESS
          ====================================== */}

          <label className="signup-field">

            <span>
              ADDRESS
            </span>


            <input
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Street / House address"
              autoComplete="street-address"
            />

          </label>


          {/* ======================================
              CITY / STATE
          ====================================== */}

          <div className="signup-password-row">


            <label className="signup-field">

              <span>
                CITY
              </span>


              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="City"
                autoComplete="address-level2"
              />

            </label>


            <label className="signup-field">

              <span>
                STATE
              </span>


              <input
                type="text"
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                placeholder="State"
                autoComplete="address-level1"
              />

            </label>

          </div>


          {/* ======================================
              COUNTRY
          ====================================== */}

          <label className="signup-field">

            <span>
              COUNTRY
            </span>


            <input
              type="text"
              value={country}
              onChange={(event) =>
                setCountry(event.target.value)
              }
              placeholder="Country"
              autoComplete="country-name"
            />

          </label>


          {/* ======================================
              PASSWORD ROW
          ====================================== */}

          <div className="signup-password-row">


            {/* PASSWORD */}

            <label className="signup-field">

              <span>
                PASSWORD
              </span>


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
                      (previous) =>
                        !previous
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

              <span>
                CONFIRM PASSWORD
              </span>


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
                      (previous) =>
                        !previous
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


          {/* ======================================
              PASSWORD STATUS
          ====================================== */}

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


          {/* ======================================
              ERROR
          ====================================== */}

          {error && (

            <div className="signup-error">

              <span />

              {error}

            </div>

          )}


          {/* ======================================
              SUBMIT
          ====================================== */}

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


        {/* ========================================
            LOGIN
        ======================================== */}

        <div className="signup-switch">

          <span>
            Already have an account?
          </span>


          <Link to="/login">

            Log in

            <ArrowUpRight size={14} />

          </Link>

        </div>


        {/* ========================================
            LEGAL
        ======================================== */}

        <p className="signup-legal">

          By creating an account, you agree to our{" "}

          <span>
            Terms
          </span>

          {" "}and{" "}

          <span>
            Privacy Policy
          </span>.

        </p>

      </section>


      {/* ========================================
          BOTTOM BRAND
      ======================================== */}

      <div className="signup-bottom">

        <span>
          MANZILL 777
        </span>

        <i />

        <span>
          PREMIUM TRAVEL EXPERIENCE
        </span>

      </div>


    </main>

  );

}

export default Signup;