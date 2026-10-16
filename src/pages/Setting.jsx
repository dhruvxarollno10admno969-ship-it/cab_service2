
import { useEffect, useState } from "react";
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
import "./Setting.css";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the authenticated user and their saved settings.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        try {
          console.log("Authenticated user:", currentUser);
          const userRef = doc(db, "users", currentUser.uid);
          const snapshot = await getDoc(userRef);
           console.log("Profile data:", snapshot.data());
          const profile = snapshot.exists()
            ? snapshot.data()
            : {};
            

          setName(
            profile.name || currentUser.displayName || ""
          );

          setEmail(currentUser.email || "");
          setPhone(profile.phone || "");

          setRideUpdates(
            profile.settings?.rideUpdates ?? true
          );

          setPromotions(
            profile.settings?.promotions ?? false
          );
        } catch (error) {
          console.error("Settings load error:", error);
          alert("Unable to load your settings. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // Save account details without overwriting other profile fields.
  const saveProfile = async (updates) => {
    if (!auth.currentUser) {
      alert("Please sign in to update your account.");
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
      alert("Unable to save your changes. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Edit the account name.
  const handleName = async () => {
    if (!user) return;

    const newName = window.prompt(
      "Enter your name:",
      name
    );

    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert("Name cannot be empty.");
      return;
    }

    if (trimmedName.length > 100) {
      alert("Name must be 100 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      await updateProfile(user, {
        displayName: trimmedName,
      });

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
      alert("Name updated successfully.");
    } catch (error) {
      console.error("Name update error:", error);
      alert(
        "Unable to update your name. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change email using Firebase's verification process.
  const handleEmail = async () => {
    if (!user) return;

    const newEmail = window.prompt(
      "Enter your new email address:",
      email
    );

    if (newEmail === null) return;

    const trimmedEmail = newEmail.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      alert("Please enter a valid email address.");
      return;
    }

    if (trimmedEmail.toLowerCase() === email.toLowerCase()) {
      alert("This is already your email address.");
      return;
    }

    try {
      await verifyBeforeUpdateEmail(user, trimmedEmail);

      alert(
        "A verification email has been sent. " +
        "Verify the new address to complete the change."
      );
    } catch (error) {
      console.error("Email update error:", error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "For security, sign in again before changing your email."
        );
      } else {
        alert(
          error.code === "auth/operation-not-allowed"
            ? "Email changes are not enabled for this sign-in method."
            : error.code === "auth/too-many-requests"
              ? "Too many attempts. Please try again later."
              : "Unable to send the verification email."
        );
      }
    }
  };

  // Save the phone number to the user's Firestore profile.
  const handlePhone = async () => {
    if (!user) return;

    const newPhone = window.prompt(
      "Enter your phone number:",
      phone
    );

    if (newPhone === null) return;

    const trimmedPhone = newPhone.trim();

    if (
      trimmedPhone &&
      !/^\+?[0-9\s()-]{7,20}$/.test(trimmedPhone)
    ) {
      alert("Please enter a valid phone number.");
      return;
    }

    const success = await saveProfile({
      phone: trimmedPhone,
    });

    if (success) {
      setPhone(trimmedPhone);
      alert("Phone number updated successfully.");
    }
  };

  // Persist each notification preference.
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
      settings: {
        [type]: checked,
      },
    });

    if (!success) {
      if (type === "rideUpdates") {
        setRideUpdates(previousValue);
      } else {
        setPromotions(previousValue);
      }
    }
  };

  // Send a password reset email.
  const handlePassword = async () => {
    if (!user?.email) {
      alert("No email address is associated with this account.");
      return;
    }

    if (
      !window.confirm(
        `Send a password reset email to ${user.email}?`
      )
    ) {
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);

      alert(
        "Password reset email sent. Check your inbox and spam folder."
      );
    } catch (error) {
      console.error("Password reset error:", error);

      alert(
        error.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "Unable to send the password reset email."
      );
    }
  };

  // Sign out from this device.
  const handleSignOut = async () => {
    if (
      !window.confirm("Are you sure you want to sign out?")
    ) {
      return;
    }

    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Unable to sign out. Please try again.");
    }
  };

  // Permanently delete the authenticated account.
  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please sign in first.");
      return;
    }

    const confirmed = window.confirm(
      "Permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    const confirmationText = window.prompt(
      'Type DELETE to confirm account deletion:'
    );

    if (confirmationText !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    try {
      // Reauthenticate email/password users before deletion.
      const passwordProvider = currentUser.providerData.some(
        (provider) => provider.providerId === "password"
      );

      if (passwordProvider) {
        const password = window.prompt(
          "Enter your current password to confirm:"
        );

        if (password === null) return;

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );

        await reauthenticateWithCredential(
          currentUser,
          credential
        );
      } else {
        // Do not delete data unless the user can be
        // securely reauthenticated through their provider.
        alert(
          "For security, sign in again using your original " +
          "sign-in method, then retry account deletion."
        );
        return;
      }

      // Delete the known user profile document first.
      // Other collections need an explicit cleanup strategy.
      await deleteDoc(
        doc(db, "users", currentUser.uid)
      );

      // Delete the Firebase Authentication account.
      await deleteUser(currentUser);

      alert("Your account has been deleted.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Account deletion error:", error);

      if (error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential") {
        alert("Incorrect password. Your account was not deleted.");
      } else if (
        error.code === "auth/requires-recent-login"
      ) {
        alert(
          "Your session has expired. Sign in again and retry."
        );
      } else {
        alert(
          "Account deletion could not be completed. " +
          "Please check your connection and Firebase permissions."
        );
      }
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

        {/* BACK */}
        <Link to="/" className="settings-back">
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* HEADER */}
        <div className="settings-heading">
          <p className="settings-eyebrow">
            <span></span>
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
              <div className="settings-row-icon">
                <User size={19} />
              </div>
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
            >
              <div className="settings-row-icon">
                <Mail size={19} />
              </div>
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
              <div className="settings-row-icon">
                <Phone size={19} />
              </div>
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
              <div className="settings-row-icon">
                <Bell size={19} />
              </div>
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
                    handleNotification(
                      "rideUpdates",
                      event.target.checked
                    )
                  }
                />
                <span></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-icon">
                <Bell size={19} />
              </div>
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
                    handleNotification(
                      "promotions",
                      event.target.checked
                    )
                  }
                />
                <span></span>
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
            >
              <div className="settings-row-icon">
                <Lock size={19} />
              </div>
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
            >
              <div className="settings-row-icon">
                <LogOut size={19} />
              </div>
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
            >
              Delete
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Settings;
