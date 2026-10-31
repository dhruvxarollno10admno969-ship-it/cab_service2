import { useState, useEffect } from "react";

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
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";

import { auth, db, functions } from "../../firebase";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  // ========================================
  // FORM STATE
  // ========================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ========================================
  // UI STATE
  // ========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [googleUser, setGoogleUser] = useState(null);

  // ========================================
  // AUTHENTICATION PROTECTION
  // ========================================

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !googleUser) {
        setAlreadyLoggedIn(true);
        navigate("/", { replace: true });
      } else {
        setAlreadyLoggedIn(false);
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate, googleUser]);

  // ========================================
  // GOOGLE AUTHENTICATION
  // ========================================

  const handleGoogleSignup = async () => {
    setError("");

    if (auth.currentUser) {
      setError("You are already logged in. Please log out first.");
      return;
    }

    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      if (customerSnapshot.exists()) {
        const existingCustomer = customerSnapshot.data();

        setName(existingCustomer.name || user.displayName || "");
        setEmail(user.email || "");
        setPhone(existingCustomer.phone || "");
        setAddress(existingCustomer.address || "");
        setCity(existingCustomer.city || "");
        setState(existingCustomer.state || "");
        setCountry(existingCustomer.country || "India");
      } else {
        setName(user.displayName || "");
        setEmail(user.email || "");
      }

      setGoogleUser(user);

    } catch (error) {
      console.error("Google signup error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-up was cancelled.");
          break;

        case "auth/popup-blocked":
          setError("Your browser blocked the Google sign-in popup.");
          break;

        case "auth/account-exists-with-different-credential":
          setError(
            "An account already exists with this email. Please log in using your existing method."
          );
          break;

        default:
          setError(
            error.message || "Unable to continue with Google."
          );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ========================================
  // COMPLETE GOOGLE REGISTRATION
  // ========================================

  const handleGoogleComplete = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user || !googleUser || user.uid !== googleUser.uid) {
        throw new Error("Google session expired. Please sign in again.");
      }

      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      const profileData = {
        uid: user.uid,
        name: name.trim(),
        email: user.email || email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim() || "India",
        role: "customer",
        emailVerified: user.emailVerified,
        authProvider: "google",
        updatedAt: serverTimestamp(),
      };

      if (customerSnapshot.exists()) {
        await updateDoc(customerRef, profileData);
      } else {
        await setDoc(customerRef, {
          ...profileData,
          createdAt: serverTimestamp(),
        });
      }

      if (user.displayName !== name.trim()) {
        await updateProfile(user, {
          displayName: name.trim(),
        });
      }

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Google profile error:", error);

      setError(
        error.message ||
        "Unable to save your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EMAIL/PASSWORD SIGNUP
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (auth.currentUser) {
      setError("You are already logged in. Please log out first.");
      return;
    }

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
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name.trim(),
      });

      await setDoc(doc(db, "customers", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        role: "customer",
        emailVerified: false,
        authProvider: "password",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      try {
        const sendEmailOtp = httpsCallable(functions, "sendEmailOtp");

        await sendEmailOtp();

        navigate("/verify-email", {
          replace: true,
          state: {
            email: user.email,
          },
        });

      } catch (otpError) {
        console.error("OTP sending error:", otpError);

        navigate("/verify-email", {
          replace: true,
          state: {
            email: user.email,
            sendError:
              "Your account was created, but the OTP could not be sent. Please try again.",
          },
        });
      }

    } catch (error) {
      console.error("Signup error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password is too weak.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        default:
          setError(
            error.message ||
            "Unable to complete registration. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PROFILE FIELDS
  // ========================================

  const renderProfileFields = () => (
    <>
      <label className="signup-field">
        <span>FULL NAME</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          required
        />
      </label>

      <label className="signup-field">
        <span>EMAIL ADDRESS</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          readOnly={!!googleUser}
          required
        />
      </label>

      <label className="signup-field">
        <span>PHONE NUMBER</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          required
        />
      </label>

      <label className="signup-field">
        <span>ADDRESS</span>
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Street / House address"
          autoComplete="street-address"
        />
      </label>

      <div className="signup-password-row">
        <label className="signup-field">
          <span>CITY</span>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City"
            autoComplete="address-level2"
          />
        </label>

        <label className="signup-field">
          <span>STATE</span>
          <input
            type="text"
            value={state}
            onChange={(event) => setState(event.target.value)}
            placeholder="State"
            autoComplete="address-level1"
          />
        </label>
      </div>

      <label className="signup-field">
        <span>COUNTRY</span>
        <input
          type="text"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          placeholder="Country"
          autoComplete="country-name"
        />
      </label>
    </>
  );

  // ========================================
  // AUTH LOADING
  // ========================================

  if (checkingAuth || alreadyLoggedIn) {
    return (
      <main className="signup-page">
        <div className="signup-card signup-auth-loading">
          <span className="signup-loader" />
          <p>
            {alreadyLoggedIn
              ? "You are already logged in. Redirecting..."
              : "Checking your account..."}
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="signup-page">
      <div className="signup-orb signup-orb-one" />
      <div className="signup-orb signup-orb-two" />
      <div className="signup-grid" />

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

      <section className="signup-card">
        <Link to="/" className="signup-logo">
          <span className="signup-logo-mark">M</span>
          <span className="signup-logo-text">
            MANZILL <strong>777</strong>
          </span>
        </Link>

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

        {!googleUser && (
          <>
            <button
              type="button"
              className="signup-google-button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <>
                  <span className="signup-google-loader" />
                  <span>CONNECTING TO GOOGLE...</span>
                </>
              ) : (
                <>
                  <svg
                    className="signup-google-icon"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.6 5.9c4.43-4.09 7.16-10.11 7.16-17.55z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.5 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.6-5.9c-2.12 1.43-4.84 2.28-8.3 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowUpRight className="signup-google-arrow" size={18} />
                </>
              )}
            </button>

            <div className="signup-divider">
              <span />
              <small>OR SIGN UP WITH EMAIL</small>
              <span />
            </div>
          </>
        )}

        {googleUser && (
          <div className="signup-google-connected">
            <span className="signup-google-connected-dot" />
            Google account connected: {googleUser.email}
          </div>
        )}

        <form
          className="signup-form"
          onSubmit={googleUser ? handleGoogleComplete : handleSubmit}
        >
          {renderProfileFields()}

          {!googleUser && (
            <>
              <div className="signup-password-row">
                <label className="signup-field">
                  <span>PASSWORD</span>

                  <div className="signup-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="signup-eye"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
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

                <label className="signup-field">
                  <span>CONFIRM PASSWORD</span>

                  <div className="signup-input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="signup-eye"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
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
            </>
          )}

          {error && (
            <div className="signup-error" role="alert">
              <span />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="signup-button"
            disabled={loading || googleLoading}
          >
            <span>
              {loading
                ? "SAVING PROFILE..."
                : googleUser
                  ? "COMPLETE REGISTRATION"
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

          {googleUser && (
            <button
              type="button"
              className="signup-google-cancel"
              onClick={async () => {
                try {
                  await signOut(auth);

                  setGoogleUser(null);
                  setName("");
                  setEmail("");
                  setPhone("");
                  setAddress("");
                  setCity("");
                  setState("");
                  setCountry("India");
                  setError("");
                } catch (error) {
                  console.error("Google sign-out error:", error);
                  setError("Unable to disconnect Google. Please try again.");
                }
              }}
            >
              Use a different account
            </button>
          )}
        </form>

        <div className="signup-switch">
          <span>Already have an account?</span>

          <Link to="/login">
            Log in
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <p className="signup-legal">
          By creating an account, you agree to our{" "}
          <span>Terms</span> and <span>Privacy Policy</span>.
        </p>
      </section>

      <div className="signup-bottom">
        <span>MANZILL 777</span>
        <i />
        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </div>
    </main>
  );
}

export default Signup;
