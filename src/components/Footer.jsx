
import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  LockKeyhole,
  MoveUp,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Footer.css";

const ADMIN_EMAIL = "admin@gmail.com";

function Footer() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAdminLogin = () => {
    const currentUser = auth.currentUser;

    if (currentUser?.email === ADMIN_EMAIL) {
      navigate("/admin");
    } else {
      navigate("/admin/login");
    }
  };

  return (
    <footer className="site-footer">
      {/* CTA SECTION */}
      
      

      {/* MAIN FOOTER */}
      <div className="footer-main">
        {/* BRAND */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
            aria-label="MANZILL 777 Home"
          >
            <span className="footer-logo-mark">M</span>

            <span className="footer-logo-text">
              MANZILL <span>777</span>
            </span>
          </Link>

          <p className="footer-description">
            Your trusted travel partner for city rides,
            airport transfers, outstation trips and
            comfortable everyday travel.
          </p>

          <a
            href="tel:+919815489193"
            className="footer-phone"
          >
            <span className="footer-contact-icon">
              <Phone size={16} />
            </span>

            <span>+91 98154 89193</span>
          </a>

          <button
            type="button"
            className="footer-admin-login"
            onClick={handleAdminLogin}
          >
            <LockKeyhole size={14} />
            Admin Login
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="footer-column">
          <h3 className="footer-title">EXPLORE</h3>

          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/fleet">Our Fleet</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* SERVICES */}
        <div className="footer-column">
          <h3 className="footer-title">OUR SERVICES</h3>

          <Link to="/booking">City Rides</Link>
          <Link to="/booking">Airport Transfers</Link>
          <Link to="/booking">Outstation Rides</Link>
          <Link to="/booking">Corporate Travel</Link>
          <Link to="/booking">Book a Ride</Link>
        </div>

        {/* CONTACT */}
        <div className="footer-column footer-contact-column">
          <h3 className="footer-title">GET IN TOUCH</h3>

          <a href="tel:+919815489193" className="footer-contact-link">
            <span className="footer-contact-icon">
              <Phone size={16} />
            </span>

            <span>+91 98154 89193</span>
          </a>

          <a
            href="mailto:hello@manzill777.com"
            className="footer-contact-link"
          >
            <span className="footer-contact-icon">
              <Mail size={16} />
            </span>

            <span>hello@manzill777.com</span>
          </a>

          <div className="footer-contact-link footer-location">
            <span className="footer-contact-icon">
              <MapPin size={16} />
            </span>

            <span>Chandigarh &amp; Tricity</span>
          </div>

          <span className="footer-service-status">
            <span className="footer-status-dot" />
            Here for your next ride
          </span>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MANZILL 777.
          All rights reserved.
        </p>

        <Link to="/" className="footer-bottom-brand">
          MANZILL <span>777</span>
        </Link>

        <p className="footer-bottom-tagline">
          RIDE COMFORTABLY. TRAVEL CONFIDENTLY.
        </p>
      </div>

      {/* BACK TO TOP */}
      <button
        type="button"
        className="footer-top"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        <MoveUp size={17} />
      </button>
    </footer>
  );
}

export default Footer;
