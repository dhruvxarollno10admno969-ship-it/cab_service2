
import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Lock,
  LogOut,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import {
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signOut,
  verifyBeforeUpdateEmail,
  updateProfile,
} from "firebase/auth";

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "./setting.css";

function Settings() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resolverRef = useRef(null);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialog, setDialog] = useState(null);
  const [dialogValue, setDialogValue] = useState("");
  const [dialogBusy, setDialogBusy] = useState(false);

  // Custom dialog system
  const showDialog = (options) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogValue(options.defaultValue || "");
      setDialog(options);
      setDialogBusy(false);
    });

  const closeDialog = (result = null) => {
    if (dialogBusy) return;

    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    setDialogValue("");
    resolve?.(result);
  };

  const showAlert = (message, title = "Notice") =>
    showDialog({
      type: "alert",
      title,
      message,
    });

  const showConfirm = (message, title = "Please confirm") =>
    showDialog({
      type: "confirm",
      title,
      message,
    });

  const showPrompt = (message, defaultValue = "", title = "Update details") =>
    showDialog({
      type: "prompt",
      title,
      message,
      defaultValue,
    });

  useEffect(() => {
    if (dialog?.type === "prompt") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [dialog]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);
        const profile = snapshot.exists() ? snapshot.data() : {};

        setName(profile.name || currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(profile.phone || "");
        setRideUpdates(profile.settings?.rideUpdates ?? true);
        setPromotions(profile.settings?.promotions ?? false);
      } catch (error) {
        console.error("Settings load error:", error);
        await showAlert("Unable to load your settings. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const saveProfile = async (updates) => {
    if (!auth.currentUser) {
      await showAlert("Please sign in to update your account.");
      return false;
    }

    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        updates,
        { merge: true }
      );
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      await showAlert("Unable to save your changes. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update name
  const handleName = async () => {
    if (!user || saving) return;

    const newName = await showPrompt(
      "Enter the name you want to display on your account.",
      name,
      "Update your name"
    );

    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {
      await showAlert("Name cannot be empty.");
      return;
    }

    if (trimmedName.length > 100) {
      await showAlert("Name must be 100 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      await updateProfile(user, { displayName: trimmedName });

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: trimmedName,
          email: user.email || "",
        },
        { merge: true }
      );

      setName(trimmedName);
      await showAlert("Your name has been updated successfully.", "All set!");
    } catch (error) {
      console.error("Name update error:", error);
      await showAlert("Unable to update your name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Update email
  const handleEmail = async () => {
    if (!user || saving) return;

    const newEmail = await showPrompt(
      "Enter your new email address. You will need to verify it.",
      email,
      "Change email address"
    );

    if (newEmail === null) return;

    const trimmedEmail = newEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      await showAlert("Please enter a valid email address.");
      return;
    }

    if (trimmedEmail.toLowerCase() === email.toLowerCase()) {
      await showAlert("This is already your email address.");
      return;
    }

    setSaving(true);

    try {
      await verifyBeforeUpdateEmail(user, trimmedEmail);

      await showAlert(
        "A verification email has been sent. Verify the new address to complete the change.",
        "Check your inbox"
      );
    } catch (error) {
      console.error("Email update error:", error);

      let message = "Unable to send the verification email.";

      if (error.code === "auth/requires-recent-login") {
        message = "For security, sign in again before changing your email.";
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Email changes are not enabled for this sign-in method.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
      }

      await showAlert(message);
    } finally {
      setSaving(false);
    }
  };

  // Update phone
  const handlePhone = async () => {
    if (!user || saving) return;

    const newPhone = await showPrompt(
      "Enter your contact number.",
      phone,
      "Update phone number"
    );

    if (newPhone === null) return;

    const trimmedPhone = newPhone.trim();

    if (trimmedPhone && !/^\+?[0-9\s()-]{7,20}$/.test(trimmedPhone)) {
      await showAlert("Please enter a valid phone number.");
      return;
    }

    const success = await saveProfile({ phone: trimmedPhone });

    if (success) {
      setPhone(trimmedPhone);
      await showAlert("Your phone number has been updated.", "All set!");
    }
  };

  // Notification preferences
  const handleNotification = async (type, checked) => {
    if (!user || saving) return;

    const previousValue =
      type === "rideUpdates" ? rideUpdates : promotions;

    if (type === "rideUpdates") {
      setRideUpdates(checked);
    } else {
      setPromotions(checked);
    }

    const success = await saveProfile({
      settings: { [type]: checked },
    });

    if (!success) {
      if (type === "rideUpdates") {
        setRideUpdates(previousValue);
      } else {
        setPromotions(previousValue);
      }
    }
  };

  // Password reset
  const handlePassword = async () => {
    if (!user?.email) {
      await showAlert("No email address is associated with this account.");
      return;
    }

    const confirmed = await showConfirm(
      `Send a password reset email to ${user.email}?`,
      "Reset your password"
    );

    if (!confirmed) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      await showAlert(
        "Password reset email sent. Check your inbox and spam folder.",
        "Email sent"
      );
    } catch (error) {
      console.error("Password reset error:", error);
      await showAlert(
        error.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "Unable to send the password reset email."
      );
    }
  };

  // Sign out
  const handleSignOut = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to sign out from this device?",
      "Sign out"
    );

    if (!confirmed) return;

    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      await showAlert("Unable to sign out. Please try again.");
    }
  };

  // Permanently delete account
  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      await showAlert("Please sign in first.");
      return;
    }

    const confirmed = await showConfirm(
      "This permanently deletes your Firebase Authentication account and user profile. This action cannot be undone.",
      "Delete account permanently"
    );

    if (!confirmed) return;

    const confirmationText = await showPrompt(
      'Type DELETE exactly to confirm account deletion.',
      "",
      "Final confirmation"
    );

    if (confirmationText !== "DELETE") {
      if (confirmationText !== null) {
        await showAlert("Confirmation did not match. Account deletion cancelled.");
      }
      return;
    }

    const passwordProvider = currentUser.providerData.some(
      (provider) => provider.providerId === "password"
    );

    if (!passwordProvider) {
      await showAlert(
        "For security, sign in again using your original sign-in method, then retry account deletion."
      );
      return;
    }

    const password = await showPrompt(
      "Enter your current password to verify your identity.",
      "",
      "Verify your password"
    );

    if (password === null) return;

    if (!password) {
      await showAlert("Password is required to delete your account.");
      return;
    }

    setSaving(true);

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );

      await reauthenticateWithCredential(currentUser, credential);

      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteUser(currentUser);

      await showAlert("Your account has been deleted.", "Account deleted");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Account deletion error:", error);

      let message =
        "Account deletion could not be completed. Please check your connection and Firebase permissions.";

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "Incorrect password. Your account was not deleted.";
      } else if (error.code === "auth/requires-recent-login") {
        message = "Your session has expired. Sign in again and retry.";
      }

      await showAlert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <p>Loading your settings...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <h2>Please sign in first</h2>
          <p>You need to be signed in to manage your account.</p>
          <Link to="/">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-container">
        <Link to="/" className="settings-back">
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <div className="settings-heading">
          <p className="settings-eyebrow">
            <span />
            ACCOUNT SETTINGS
          </p>

          <h1>
            Manage your
            <br />
            <span>account.</span>
          </h1>

          <p>
            Control your account, notifications
            and security preferences.
          </p>
        </div>

        {/* ACCOUNT */}
        <section className="settings-section">
          <div className="settings-section-title">
            <User size={20} />
            <div>
              <h2>Account</h2>
              <p>Your personal account information</p>
            </div>
          </div>

          <div className="settings-card">
            <button
              type="button"
              className="settings-row settings-button"
              onClick={handleName}
              disabled={saving}
            >
              <div className="settings-row-icon"><User size={19} /></div>
              <div className="settings-row-content">
                <span>Name</span>
                <strong>{name || "Add your name"}</strong>
              </div>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="settings-row settings-button"
              onClick={handleEmail}
              disabled={saving}
            >
              <div className="settings-row-icon"><Mail size={19} /></div>
              <div className="settings-row-content">
                <span>Email</span>
                <strong>{email || "No email available"}</strong>
              </div>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="settings-row settings-button"
              onClick={handlePhone}
              disabled={saving}
            >
              <div className="settings-row-icon"><Phone size={19} /></div>
              <div className="settings-row-content">
                <span>Phone number</span>
                <strong>{phone || "Add phone number"}</strong>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="settings-section">
          <div className="settings-section-title">
            <Bell size={20} />
            <div>
              <h2>Notifications</h2>
              <p>Choose what you want to receive</p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-icon"><Bell size={19} /></div>
              <div className="settings-row-content">
                <span>Ride updates</span>
                <strong>Booking and driver updates</strong>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={rideUpdates}
                  disabled={saving}
                  onChange={(event) =>
                    handleNotification("rideUpdates", event.target.checked)
                  }
                />
                <span />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-icon"><Bell size={19} /></div>
              <div className="settings-row-content">
                <span>Offers & promotions</span>
                <strong>Receive special offers</strong>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={promotions}
                  disabled={saving}
                  onChange={(event) =>
                    handleNotification("promotions", event.target.checked)
                  }
                />
                <span />
              </label>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="settings-section">
          <div className="settings-section-title">
            <Shield size={20} />
            <div>
              <h2>Security</h2>
              <p>Keep your account secure</p>
            </div>
          </div>

          <div className="settings-card">
            <button
              type="button"
              className="settings-row settings-button"
              onClick={handlePassword}
              disabled={saving}
            >
              <div className="settings-row-icon"><Lock size={19} /></div>
              <div className="settings-row-content">
                <span>Password</span>
                <strong>Reset your password by email</strong>
              </div>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="settings-row settings-button"
              onClick={handleSignOut}
              disabled={saving}
            >
              <div className="settings-row-icon"><LogOut size={19} /></div>
              <div className="settings-row-content">
                <span>Sign out</span>
                <strong>Log out from this device</strong>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="settings-section danger-section">
          <div className="settings-section-title">
            <Trash2 size={20} />
            <div>
              <h2>Danger zone</h2>
              <p>Permanent account actions</p>
            </div>
          </div>

          <div className="settings-danger-card">
            <div>
              <strong>Delete account</strong>
              <p>
                Permanently delete your account
                and its user profile.
              </p>
            </div>

            <button
              type="button"
              className="delete-account-button"
              onClick={handleDeleteAccount}
              disabled={saving}
            >
              Delete
            </button>
          </div>
        </section>
      </div>

      {/* CUSTOM DIALOG */}
      {dialog && (
        <div
          className="custom-dialog-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !dialogBusy) {
              closeDialog(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !dialogBusy) {
              closeDialog(null);
            }
          }}
        >
          <div
            className="custom-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-dialog-title"
          >
            <button
              type="button"
              className="custom-dialog-close"
              aria-label="Close dialog"
              disabled={dialogBusy}
              onClick={() => closeDialog(null)}
            >
              <X size={18} />
            </button>

            <div className={`custom-dialog-icon ${dialog.type === "confirm" ? "is-confirm" : ""}`}>
              {dialog.type === "alert" ? (
                <CheckCircle2 size={24} />
              ) : dialog.type === "confirm" ? (
                <AlertTriangle size={24} />
              ) : (
                <User size={24} />
              )}
            </div>

            <p className="custom-dialog-eyebrow">
              MANZILL <span>77</span>
            </p>

            <h2 id="custom-dialog-title">{dialog.title}</h2>
            <p className="custom-dialog-message">{dialog.message}</p>

            {dialog.type === "prompt" && (
              <input
                ref={inputRef}
                className="custom-dialog-input"
                value={dialogValue}
                onChange={(event) => setDialogValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !dialogBusy) {
                    closeDialog(dialogValue);
                  }
                }}
                placeholder="Enter here..."
                type="text"
                autoComplete="off"
              />
            )}

            <div className="custom-dialog-actions">
              {dialog.type !== "alert" && (
                <button
                  type="button"
                  className="custom-dialog-cancel"
                  disabled={dialogBusy}
                  onClick={() => closeDialog(null)}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                className="custom-dialog-confirm"
                disabled={dialogBusy}
                onClick={() =>
                  closeDialog(
                    dialog.type === "prompt" ? dialogValue : true
                  )
                }
              >
                {dialog.type === "alert"
                  ? "Got it"
                  : dialog.type === "confirm"
                    ? "Confirm"
                    : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;
