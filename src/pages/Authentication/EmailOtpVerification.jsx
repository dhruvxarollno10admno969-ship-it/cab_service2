
import { useEffect, useState } from "react";
import { onAuthStateChanged, reload } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useLocation } from "react-router-dom";
import { auth, app } from "../../firebase.js";
import "./EmailOtpVerification.css";

const functions = getFunctions(app);

const sendEmailOtp = httpsCallable(functions, "sendEmailOtp");
const verifyEmailOtp = httpsCallable(functions, "verifyEmailOtp");

export default function EmailOtpVerification({ onVerified }) {
  const location = useLocation();
  const [user, setUser] = useState(auth.currentUser);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(location.state?.sendError || "");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  async function sendCode() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Please sign in before verifying your email.");
      return;
    }

    try {
      setSending(true);

      const result = await sendEmailOtp();

      setSeconds(60);
      setMessage(result.data.message || "Verification code sent.");
    } catch (err) {
      setError(err.message || "Unable to send the verification code.");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter all six digits.");
      return;
    }

    if (!user) {
      setError("Please sign in first.");
      return;
    }

    try {
      setLoading(true);

      await verifyEmailOtp({ code });

      // Refresh Firebase's client-side user record and ID token.
      await reload(user);
      await user.getIdToken(true);

      setMessage("Your email has been verified successfully.");
      setCode("");

      if (onVerified) {
        onVerified(user);
      }
    } catch (err) {
      setError(err.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <section className="otp-card">
        <h2>Verify your email</h2>
        <p>Please sign in to continue.</p>
      </section>
    );
  }

  if (user.emailVerified) {
    return (
      <section className="otp-card">
        <div className="otp-icon">✓</div>
        <h2>Email verified</h2>
        <p>Your email address has been verified.</p>
      </section>
    );
  }

  return (
    <section className="otp-card">
      <div className="otp-icon">✉</div>

      <p className="otp-label">EMAIL VERIFICATION</p>
      <h2>Check your inbox</h2>

      <p className="otp-description">
        Enter the six-digit code sent to{" "}
        <strong>{user.email}</strong>.
      </p>

      <button
        className="otp-send-button"
        type="button"
        onClick={sendCode}
        disabled={sending || seconds > 0}
      >
        {sending
          ? "Sending code..."
          : seconds > 0
            ? `Resend code in ${seconds}s`
            : "Send verification code"}
      </button>

      <form onSubmit={verifyCode}>
        <label htmlFor="email-otp">Verification code</label>

        <input
          id="email-otp"
          className="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
          required
        />

        {error && <p className="otp-error" role="alert">{error}</p>}
        {message && <p className="otp-success" role="status">{message}</p>}

        <button
          className="otp-verify-button"
          type="submit"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>
    </section>
  );
}
