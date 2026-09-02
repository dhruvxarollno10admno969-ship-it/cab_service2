import React, { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Home, Pencil, Save } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import "../App.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });

  

  /* ================= GET USER ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setFormData({
          name: data.name || currentUser.displayName || "",
          email: currentUser.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "India",
        });
      } else {
        setFormData({
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          phone: "",
          address: "",
          city: "",
          state: "",
          country: "India",
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          uid: user.uid,
          name: formData.name,
          email: user.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        { merge: true }
      );

      setEditing(false);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  /* ================= NOT LOGGED IN ================= */

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Please login first</h2>
        </div>
      </div>
    );
  }

  const avatarLetter =
    formData.name?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <main className="profile-page">
 {/* HEADER */}
      <header className="profile-header">

        <Link to="/" className="profile-back">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

      <Link to="/" className="profile-logo ">
          <span>MANZILL 777</span>
        </Link>

      </header>

      <div className="profile-container">

        {/* ================= HEADER ================= */}

        <div className="profile-title">

          <div>
            <span className="profile-label">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and account details.
            </p>
          </div>

          {!editing ? (
            <button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <button
              className="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}

        </div>


        {/* ================= PROFILE CARD ================= */}

        <section className="profile-card">

          <div className="profile-user">

            <div className="profile-big-avatar">
              {avatarLetter}
            </div>

            <div>
              <h2>
                {formData.name || "User"}
              </h2>

              <p>
                {user.email}
              </p>
            </div>

          </div>


          <div className="profile-divider" />


          {/* ================= PERSONAL INFORMATION ================= */}

          <div className="personal-section">

            <div className="section-heading">

              <div>
                <h3>Personal Information</h3>

                <p>
                  Your basic account information
                </p>
              </div>

            </div>


            <div className="profile-grid">

              {/* NAME */}

              <div className="profile-field">

                <label>
                  <User size={16} />
                  Full Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="field-value">
                    {formData.name || "Not added"}
                  </div>
                )}

              </div>


              {/* EMAIL */}

              <div className="profile-field">

                <label>
                  <Mail size={16} />
                  Email
                </label>

                <div className="field-value">
                  {user.email}
                </div>

              </div>


              {/* PHONE */}

              <div className="profile-field">

                <label>
                  <Phone size={16} />
                  Phone Number
                </label>

                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                ) : (
                  <div className="field-value">
                    {formData.phone || "Not added"}
                  </div>
                )}

              </div>


              {/* CITY */}

              <div className="profile-field">

                <label>
                  <MapPin size={16} />
                  City
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                ) : (
                  <div className="field-value">
                    {formData.city || "Not added"}
                  </div>
                )}

              </div>


              {/* ADDRESS */}

              <div className="profile-field full-width">

                <label>
                  <Home size={16} />
                  Home Address
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your home address"
                  />
                ) : (
                  <div className="field-value">
                    {formData.address || "Not added"}
                  </div>
                )}

              </div>


              {/* STATE */}

              <div className="profile-field">

                <label>
                  <MapPin size={16} />
                  State
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter your state"
                  />
                ) : (
                  <div className="field-value">
                    {formData.state || "Not added"}
                  </div>
                )}

              </div>


              {/* COUNTRY */}

              <div className="profile-field">

                <label>
                  <MapPin size={16} />
                  Country
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter your country"
                  />
                ) : (
                  <div className="field-value">
                    {formData.country || "India"}
                  </div>
                )}

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Profile;