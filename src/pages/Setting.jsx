import { useState, useEffect } from "react";
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

import { Link } from "react-router-dom";

import "../App.css";

function Settings() {
  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

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


        {/* ================= ACCOUNT ================= */}

        <section className="settings-section">

          <div className="settings-section-title">
            <User size={20} />

            <div>
              <h2>Account</h2>
              <p>Your personal account information</p>
            </div>
          </div>


          <div className="settings-card">

            {/* NAME */}

            <div className="settings-row">

              <div className="settings-row-icon">
                <User size={19} />
              </div>

              <div className="settings-row-content">
                <span>Name</span>
                <strong>Your Name</strong>
              </div>

              <ChevronRight size={18} />

            </div>


            {/* EMAIL */}

            <div className="settings-row">

              <div className="settings-row-icon">
                <Mail size={19} />
              </div>

              <div className="settings-row-content">
                <span>Email</span>
                <strong>your@email.com</strong>
              </div>

              <ChevronRight size={18} />

            </div>


            {/* PHONE */}

            <div className="settings-row">

              <div className="settings-row-icon">
                <Phone size={19} />
              </div>

              <div className="settings-row-content">
                <span>Phone number</span>
                <strong>Add phone number</strong>
              </div>

              <ChevronRight size={18} />

            </div>

          </div>

        </section>


        {/* ================= NOTIFICATIONS ================= */}

        <section className="settings-section">

          <div className="settings-section-title">

            <Bell size={20} />

            <div>
              <h2>Notifications</h2>
              <p>Choose what you want to receive</p>
            </div>

          </div>


          <div className="settings-card">

            {/* RIDE UPDATES */}

            <div className="settings-row">

              <div className="settings-row-icon">
                <Bell size={19} />
              </div>

              <div className="settings-row-content">
                <span>Ride updates</span>
                <strong>
                  Booking and driver updates
                </strong>
              </div>

              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={rideUpdates}
                  onChange={() =>
                    setRideUpdates(!rideUpdates)
                  }
                />

                <span></span>

              </label>

            </div>


            {/* PROMOTIONS */}

            <div className="settings-row">

              <div className="settings-row-icon">
                <Bell size={19} />
              </div>

              <div className="settings-row-content">
                <span>Offers & promotions</span>
                <strong>
                  Receive special offers
                </strong>
              </div>

              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={promotions}
                  onChange={() =>
                    setPromotions(!promotions)
                  }
                />

                <span></span>

              </label>

            </div>

          </div>

        </section>


        {/* ================= SECURITY ================= */}

        <section className="settings-section">

          <div className="settings-section-title">

            <Shield size={20} />

            <div>
              <h2>Security</h2>
              <p>Keep your account secure</p>
            </div>

          </div>


          <div className="settings-card">

            {/* PASSWORD */}

            <Link
              to="/change-password"
              className="settings-row settings-link"
            >

              <div className="settings-row-icon">
                <Lock size={19} />
              </div>

              <div className="settings-row-content">
                <span>Password</span>
                <strong>
                  Change your password
                </strong>
              </div>

              <ChevronRight size={18} />

            </Link>


            {/* LOGOUT */}

            <button className="settings-row settings-button">

              <div className="settings-row-icon">
                <LogOut size={19} />
              </div>

              <div className="settings-row-content">
                <span>Sign out</span>
                <strong>
                  Log out from this device
                </strong>
              </div>

              <ChevronRight size={18} />

            </button>

          </div>

        </section>


        {/* ================= DANGER ================= */}

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

              <strong>
                Delete account
              </strong>

              <p>
                Permanently delete your account
                and all associated data.
              </p>

            </div>

            <button className="delete-account-button">
              Delete
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Settings;