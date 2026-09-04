import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="site-footer">

      {/* ================= FOOTER MAIN ================= */}
      <div className="footer-main">

        {/* BRAND */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">
              M
            </span>

            <span className="footer-logo-text">
              MANZILL <small>777</small>
            </span>
          </Link>

          <p className="footer-description">
            Reliable rides for everyday journeys,
            airport transfers and everything in between.
          </p>

          <a
            href="tel:+919815489193"
            className="footer-phone"
          >
            <Phone size={17} />
            <span>+91 98154 89193</span>
          </a>

        </div>


        {/* NAVIGATION */}
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


        {/* SERVICES */}
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


        {/* CONTACT */}
        <div className="footer-column">

          <span className="footer-title">
            GET IN TOUCH
          </span>

          <a href="tel:+919815489193">
            <Phone size={16} />
            +91 98154 89193
          </a>

          <a href="mailto:hello@manzill777.com">
            <Mail size={16} />
            hello@manzill777.com
          </a>

          <span className="footer-location">
            <MapPin size={16} />
            Chandigarh & Tricity
          </span>

        </div>

      </div>


      {/* ================= CTA ================= */}
      <div className="footer-cta">

        <div className="footer-cta-content">

          <span className="footer-cta-label">
            READY TO RIDE?
          </span>

          <h2>
            Your journey
            <br />
            <span>starts here.</span>
          </h2>

        </div>


        <Link
          to="/booking"
          className="footer-book"
        >
          <span>Book a Ride</span>
          <ArrowUpRight size={19} />
        </Link>

      </div>


      {/* ================= BOTTOM ================= */}
      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} MANZILL 777
        </span>

        <span className="footer-bottom-center">
          MANZILL 777
        </span>

        <span>
          EVERY JOURNEY MATTERS.
        </span>

        <button
          type="button"
          className="footer-top"
          onClick={scrollToTop}
        >
          Back to top
          <ArrowUpRight size={16} />
        </button>

      </div>

    </footer>
  );
}

export default Footer;