
import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  ShieldCheck,
  UserRound,
  MapPin,
  Phone,
  Mail,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./complete-profile.css";

function CompleteProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // CHECK AUTHENTICATION
  // ========================================

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const customerRef = doc(db, "customers", currentUser.uid);
        const snapshot = await getDoc(customerRef);

        if (!active) return;

        if (snapshot.exists()) {
          const data = snapshot.data();

          // Check whether the profile is already complete.
          const requiredFields = [
            "name",
            "phone",
            "address",
            "city",
            "state",
            "country",
          ];

          const complete = requiredFields.every((field) =>
            String(data[field] || "").trim()
          );

          if (complete && data.profileCompleted === true) {
            navigate("/", { replace: true });
            return;
          }

          setForm({
            name: data.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "India",
          });
        } else {
          // Create missing customer record.
          await setDoc(customerRef, {
            uid: currentUser.uid,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "India",
            role: "customer",
            emailVerified: currentUser.emailVerified,
            authProvider: "google",
            profileCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          if (!active) return;

          setForm({
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "India",
          });
        }

        setUser(currentUser);
      } catch (err) {
        console.error("Profile loading error:", err);

        if (active) {
          setError("Unable to load your profile. Please refresh and try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  // ========================================
  // INPUT HANDLER
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ========================================
  // PROFILE COMPLETION
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user || auth.currentUser?.uid !== user.uid) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const requiredFields = [
      { field: "name", label: "Full name" },
      { field: "phone", label: "Phone number" },
      { field: "address", label: "Address" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
      { field: "country", label: "Country" },
    ];

    for (const item of requiredFields) {
      if (!String(form[item.field] || "").trim()) {
        setError(`${item.label} is required.`);
        return;
      }
    }

    const cleanedPhone = form.phone.trim();

    // Accept Indian numbers with optional +91 prefix.
    const phoneDigits = cleanedPhone.replace(/\D/g, "");

    const validIndianPhone =
      /^[6-9]\d{9}$/.test(phoneDigits) ||
      /^91[6-9]\d{9}$/.test(phoneDigits);

    if (!validIndianPhone) {
      setError("Please enter a valid Indian mobile number.");
      return;
    }

    try {
      setSaving(true);

      const customerRef = doc(db, "customers", user.uid);

      const customerSnapshot = await getDoc(customerRef);

      if (!customerSnapshot.exists()) {
        throw new Error("Customer record not found. Please sign in again.");
      }

      const existingData = customerSnapshot.data();

      if (existingData.role && existingData.role !== "customer") {
        throw new Error("This account is not registered as a customer.");
      }

      const profileData = {
        uid: user.uid,
        name: form.name.trim(),
        email: user.email || form.email,
        phone: cleanedPhone,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        role: "customer",
        emailVerified: user.emailVerified,
        authProvider: "google",
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        customerRef,
        profileData,
        { merge: true }
      );

      // Update Firebase display name.
      if (user.displayName !== form.name.trim()) {
        await updateProfile(user, {
          displayName: form.name.trim(),
        });
      }

      navigate("/", { replace: true });

    } catch (err) {
      console.error("Profile completion error:", err);

      setError(
        err.message || "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // SIGN OUT
  // ========================================

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to sign out. Please try again.");
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <main className="complete-profile-page">
        <div className="complete-profile-loading">
          <span className="complete-profile-loader" />
          <p>Preparing your profile...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="complete-profile-page">

      <div className="complete-profile-orb one" />
      <div className="complete-profile-orb two" />
      <div className="complete-profile-grid" />

      <section className="complete-profile-card">

        <div className="complete-profile-icon">
          <UserRound size={27} />
        </div>

        <div className="complete-profile-heading">

          <div className="complete-profile-eyebrow">
            <span />
            ONE LAST STEP
          </div>

          <h1>
            Complete your
            <br />
            <em>profile.</em>
          </h1>

          <p>
            Tell us a little about yourself so we can
            provide a better travel experience.
          </p>

        </div>

        <div className="complete-profile-notice">
          <ShieldCheck size={17} />
          <span>
            Profile completion is required before accessing MANZILL 777.
          </span>
        </div>

        <form
          className="complete-profile-form"
          onSubmit={handleSubmit}
        >

          {/* PERSONAL DETAILS */}

          <div className="complete-profile-section-title">
            <UserRound size={16} />
            PERSONAL DETAILS
          </div>

          <label className="complete-profile-field">
            <span>FULL NAME <b>*</b></span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={80}
              required
            />
          </label>

          <label className="complete-profile-field">
            <span>EMAIL ADDRESS</span>

            <div className="complete-profile-input-wrap">
              <Mail size={17} />

              <input
                type="email"
                value={form.email}
                readOnly
                autoComplete="email"
              />
            </div>
          </label>

          <label className="complete-profile-field">
            <span>PHONE NUMBER <b>*</b></span>

            <div className="complete-profile-input-wrap">
              <Phone size={17} />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                maxLength={15}
                required
              />
            </div>
          </label>

          {/* ADDRESS DETAILS */}

          <div className="complete-profile-section-title address-title">
            <MapPin size={16} />
            ADDRESS DETAILS
          </div>

          <label className="complete-profile-field">
            <span>FULL ADDRESS <b>*</b></span>

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="House number, street, locality"
              autoComplete="street-address"
              maxLength={200}
              required
            />
          </label>

          <div className="complete-profile-row">

            <label className="complete-profile-field">
              <span>CITY <b>*</b></span>

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                autoComplete="address-level2"
                required
              />
            </label>

            <label className="complete-profile-field">
              <span>STATE <b>*</b></span>

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Your state"
                autoComplete="address-level1"
                required
              />
            </label>

          </div>

          <label className="complete-profile-field">
            <span>COUNTRY <b>*</b></span>

            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country"
              autoComplete="country-name"
              required
            />
          </label>

          {error && (
            <div className="complete-profile-error" role="alert">
              <span />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="complete-profile-submit"
            disabled={saving}
          >
            <span>
              {saving ? "SAVING YOUR PROFILE..." : "COMPLETE REGISTRATION"}
            </span>

            {saving ? (
              <span className="complete-profile-loader small" />
            ) : (
              <span className="complete-profile-submit-icon">
                <ArrowUpRight size={19} />
              </span>
            )}
          </button>

          <p className="complete-profile-footer">
            <ShieldCheck size={14} />
            Your information is securely stored.
          </p>

        </form>

      </section>

      <footer className="complete-profile-bottom">
        <span>MANZILL 777</span>
        <i />
        <span>PREMIUM TRAVEL EXPERIENCE</span>
      </footer>

    </main>
  );
}

export default CompleteProfile;
