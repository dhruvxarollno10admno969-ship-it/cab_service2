import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  LockKeyhole,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { auth } from "../firebase";

import "./Footer.css";


// =====================================================
// ADMIN EMAIL
// =====================================================

const ADMIN_EMAIL = "admin@gmail.com";


function Footer() {
  const navigate = useNavigate();


  // =====================================================
  // BACK TO TOP
  // =====================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const handleAdminLogin = () => {
    const currentUser = auth.currentUser;

    // ---------------------------------------------------
    // ADMIN ALREADY LOGGED IN
    // ---------------------------------------------------

    if (currentUser?.email === ADMIN_EMAIL) {
      navigate("/admin");
      return;
    }

    // ---------------------------------------------------
    // CUSTOMER LOGGED IN OR NO USER LOGGED IN
    // ---------------------------------------------------

    navigate("/admin/login");
  };


  return (
    <footer className="site-footer">


      {/* =================================================
          FOOTER MAIN
      ================================================= */}

      <div className="footer-main">


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="footer-brand">


          {/* LOGO */}

          <Link
            to="/"
            className="footer-logo"
            aria-label="MANZILL 777 Home"
          >

            <span className="footer-logo-mark">
              M
            </span>

            <span className="footer-logo-text">
              MANZILL <small>777</small>
            </span>

          </Link>


          {/* DESCRIPTION */}

          <p className="footer-description">
            Reliable rides for everyday journeys,
            airport transfers and everything in between.
          </p>


          {/* PHONE */}

          <a
            href="tel:+919815489193"
            className="footer-phone"
          >

            <Phone size={17} />

            <span>
              +91 98154 89193
            </span>

          </a>


          {/* =================================================
              ADMIN LOGIN BUTTON
          ================================================= */}

          <button
            type="button"
            className="footer-admin-login"
            onClick={handleAdminLogin}
            aria-label="Open admin login"
          >

            <LockKeyhole size={12} />

            <span>
              Admin Login
            </span>

          </button>


        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="footer-column">

          <span className="footer-title">
            NAVIGATION
          </span>


          <Link to="/">
            Home
          </Link>


          <Link to="/services">
            Services
          </Link>


          <Link to="/fleet">
            Fleet
          </Link>


          <Link to="/about">
            About
          </Link>


          <Link to="/contact">
            Contact
          </Link>

        </div>


        {/* =================================================
            SERVICES
        ================================================= */}

        <div className="footer-column">

          <span className="footer-title">
            SERVICES
          </span>


          <Link to="/booking">
            City Rides
          </Link>


          <Link to="/booking">
            Airport Transfers
          </Link>


          <Link to="/booking">
            Outstation Rides
          </Link>


          <Link to="/booking">
            Corporate Travel
          </Link>


          <Link to="/booking">
            Quick Booking
          </Link>

        </div>


        {/* =================================================
            GET IN TOUCH
        ================================================= */}

        <div className="footer-column">

          <span className="footer-title">
            GET IN TOUCH
          </span>


          {/* PHONE */}

          <a href="tel:+919815489193">

            <Phone size={16} />

            <span>
              +91 98154 89193
            </span>

          </a>


          {/* EMAIL */}

          <a href="mailto:hello@manzill777.com">

            <Mail size={16} />

            <span>
              hello@manzill777.com
            </span>

          </a>


          {/* LOCATION */}

          <span className="footer-location">

            <MapPin size={16} />

            <span>
              Chandigarh & Tricity
            </span>

          </span>

        </div>


      </div>


      {/* =================================================
          FOOTER BOTTOM
      ================================================= */}

      <div className="footer-bottom">


        {/* COPYRIGHT */}

        <span>
          © {new Date().getFullYear()} MANZILL 777
        </span>


        {/* CENTER BRAND */}

        <span className="footer-bottom-center">
          MANZILL 777
        </span>


        {/* TAGLINE */}

        <span className="footer-bottom-tagline">
          EVERY JOURNEY MATTERS.
        </span>


        {/* BACK TO TOP */}

        <button
          type="button"
          className="footer-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >

          <span>
            Back to top
          </span>

          <ArrowUpRight size={16} />

        </button>


      </div>


    </footer>
  );
}


export default Footer;