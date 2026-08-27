import React, { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">

      {/* ================= LOGO ================= */}
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <span className="logo-mark">M</span>

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


      {/* ================= RIGHT ACTIONS ================= */}
      <div className="navbar-actions">

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
        <Link
          to="/booking"
          className="navbar-book"
        >
          Book a Ride
          <ArrowUpRight size={17} />
        </Link>

      </div>


      {/* ================= MOBILE BUTTON ================= */}
      <button
        className="navbar-menu"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
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


          {/* MOBILE ACTIONS */}
          <div className="mobile-actions">

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