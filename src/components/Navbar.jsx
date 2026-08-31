import React, { useEffect, useState } from "react";

import {
  Menu,
  X,
  ArrowUpRight,
  User,
  ChevronDown,
  Car,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

import "../App.css";

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();


  /* ================= FIREBASE USER ================= */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {

        setUser(currentUser);

      }
    );

    return () => unsubscribe();

  }, []);


  /* ================= MENU ================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };


  const isActive = (path) => {
    return location.pathname === path;
  };


  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await signOut(auth);

      setProfileOpen(false);

      navigate("/");

    } catch (error) {

      console.error("Logout error:", error);

    }

  };


  return (

    <header className="navbar">


      {/* ================= LOGO ================= */}

      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMenu}
      >

        <span className="logo-mark">
          M
        </span>

        <div className="logo-text">

          <span>MANZILL</span>

          <small>777</small>

        </div>

      </Link>



      {/* ================= DESKTOP NAV ================= */}

      <nav className="navbar-links">

        <Link
          to="/"
          className={isActive("/") ? "active" : ""}
        >
          Home
        </Link>

        <a href="#services">
          Services
        </a>

        <a href="#fleet">
          Fleet
        </a>

        <a href="#about">
          About
        </a>

        <a href="#contact">
          Contact
        </a>

      </nav>



      {/* ================= RIGHT SIDE ================= */}

      <div className="navbar-actions">


        {!user ? (

          /* ================= LOGGED OUT ================= */

          <>

            <Link
              to="/login"
              className="navbar-login"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="navbar-signup"
            >
              Signup
            </Link>

          </>


        ) : (

          /* ================= LOGGED IN ================= */

          <div className="profile-wrapper">


            {/* PROFILE BUTTON */}

            <button
              className="profile-button"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
            >

              <span className="profile-avatar">

                {user.displayName
                  ? user.displayName
                      .charAt(0)
                      .toUpperCase()
                  : user.email
                      ?.charAt(0)
                      .toUpperCase() || "U"}

              </span>


              <span className="profile-name">

                {user.displayName ||
                  user.email?.split("@")[0] ||
                  "User"}

              </span>


              <ChevronDown
                size={16}
                className={
                  profileOpen
                    ? "rotate-icon"
                    : ""
                }
              />

            </button>



            {/* ================= DROPDOWN ================= */}

            {profileOpen && (

              <div className="profile-dropdown">


                {/* USER INFO */}

                <div className="profile-header">

                  <div className="profile-avatar large">

                    {user.displayName
                      ? user.displayName
                          .charAt(0)
                          .toUpperCase()
                      : user.email
                          ?.charAt(0)
                          .toUpperCase() || "U"}

                  </div>


                  <div>

                    <strong>

                      {user.displayName ||
                        user.email
                          ?.split("@")[0] ||
                        "User"}

                    </strong>


                    <span>

                      {user.email}

                    </span>

                  </div>

                </div>



                <div className="profile-divider" />



                {/* MY PROFILE */}

                <Link
                  to="/profile"
                  className="profile-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >

                  <User size={18} />

                  <span>
                    My Profile
                  </span>

                </Link>



                {/* MY RIDES */}

                <Link
                  to="/booking"
                  className="profile-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >

                  <Car size={18} />

                  <span>
                    My Rides
                  </span>

                </Link>



                {/* SETTINGS */}

                <Link
                  to="/settings"
                  className="profile-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >

                  <Settings size={18} />

                  <span>
                    Settings
                  </span>

                </Link>



                <div className="profile-divider" />



                {/* LOGOUT */}

                <button
                  className="profile-item logout-item"
                  onClick={handleLogout}
                >

                  <LogOut size={18} />

                  <span>
                    Logout
                  </span>

                </button>


              </div>

            )}

          </div>

        )}

      </div>



      {/* ================= MOBILE ================= */}

      <button
        className="navbar-menu"
        type="button"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
      >

        {menuOpen ? (
          <X size={25} />
        ) : (
          <Menu size={25} />
        )}

      </button>



      {/* ================= MOBILE MENU ================= */}

      {menuOpen && (

        <div className="mobile-menu">

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <a
            href="#services"
            onClick={closeMenu}
          >
            Services
          </a>

          <a
            href="#fleet"
            onClick={closeMenu}
          >
            Fleet
          </a>

          <a
            href="#about"
            onClick={closeMenu}
          >
            About
          </a>

          <a
            href="#contact"
            onClick={closeMenu}
          >
            Contact
          </a>


          <div className="mobile-actions">

            {!user ? (

              <>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="navbar-login"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="navbar-login"
                >
                  Signup
                </Link>

              </>

            ) : (

              <>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="navbar-login"
                >
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="navbar-login"
                >
                  Logout
                </button>

              </>

            )}


            <Link
              to="/booking"
              onClick={closeMenu}
              className="navbar-book"
            >

              Book a Ride

              <ArrowUpRight size={17} />

            </Link>

          </div>

        </div>

      )}

    </header>

  );
}

export default Navbar;