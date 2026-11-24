
import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  LockKeyhole,
  MoveUp,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../firebase";
import "../styles/Footer.css";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ================= FIREBASE AUTH =================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(Boolean(user));
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ================= SCROLL TO SECTION =================

  const handleSectionClick = (event, sectionId) => {
    event.preventDefault();

    const hash = `#${sectionId}`;

    if (location.pathname === "/" && location.hash === hash) {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    navigate({
      pathname: "/",
      hash,
    });
  };

  // ================= HANDLE HASH NAVIGATION =================

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = decodeURIComponent(
      location.hash.substring(1)
    );

    const frame = requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  // ================= HOME NAVIGATION =================

  const handleHomeClick = (event) => {
    event.preventDefault();

    if (location.pathname === "/" && !location.hash) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    navigate("/");
  };

  // ================= BACK TO TOP =================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= ADMIN LOGIN =================

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <footer className="site-footer">

      {/* ================= MAIN FOOTER ================= */}

      <div className="footer-main">

        {/* BRAND */}

        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
            aria-label="MANZILL 77 Home"
            onClick={handleHomeClick}
          >
            <span className="footer-logo-mark">M</span>

            <span className="footer-logo-text">
              MANZILL <span>77</span>
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

          {!authLoading && !isLoggedIn && (
            <button
              type="button"
              className="footer-admin-login"
              onClick={handleAdminLogin}
            >
              <LockKeyhole size={14} />
              <span>Admin Login</span>
              <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        {/* ================= EXPLORE ================= */}

        <div className="footer-column">
          <h3 className="footer-title">EXPLORE</h3>

          <a
            href="/"
            onClick={handleHomeClick}
          >
            Home
          </a>

          <a
            href="/#services"
            onClick={(event) =>
              handleSectionClick(event, "services")
            }
          >
            Services
          </a>

          <a
            href="/#fleet"
            onClick={(event) =>
              handleSectionClick(event, "fleet")
            }
          >
            Our Fleet
          </a>

          <a
            href="/#about"
            onClick={(event) =>
              handleSectionClick(event, "about")
            }
          >
            About Us
          </a>

          <a
            href="/#contact"
            onClick={(event) =>
              handleSectionClick(event, "contact")
            }
          >
            Contact
          </a>
        </div>

        {/* ================= OUR SERVICES ================= */}

        <div className="footer-column">
          <h3 className="footer-title">OUR SERVICES</h3>

          <Link to="/booking">City Rides</Link>
          <Link to="/booking">Airport Transfers</Link>
          <Link to="/booking">Outstation Rides</Link>
          <Link to="/booking">Corporate Travel</Link>
          <Link to="/booking">Book a Ride</Link>
        </div>

        {/* ================= CONTACT ================= */}

        <div className="footer-column footer-contact-column">
          <h3 className="footer-title">GET IN TOUCH</h3>

          <a
            href="tel:+919815489193"
            className="footer-contact-link"
          >
            <span className="footer-contact-icon">
              <Phone size={16} />
            </span>

            <span>+91 98154 89193</span>
          </a>

        <a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=manzill7712%40gmail.com"
  target="_blank"
  rel="noopener noreferrer"
  className="footer-contact-link"
>
  <span className="footer-contact-icon">
    <Mail size={16} />
  </span>

  <span>manzill7712@gmail.com</span>
</a>

          <div className="footer-contact-link footer-location">
            <span className="footer-contact-icon">
              <MapPin size={16} />
            </span>

            <span>Jalandhar, Punjab </span>
          </div>

          <span className="footer-service-status">
            <span className="footer-status-dot" />
            Here for your next ride
          </span>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MANZILL 77.
          All rights reserved.
        </p>

        <Link
          to="/"
          className="footer-bottom-brand"
          onClick={handleHomeClick}
        >
          MANZILL <span>77</span>
        </Link>

        <p className="footer-bottom-tagline">
          RIDE COMFORTABLY. TRAVEL CONFIDENTLY.
        </p>
      </div>

      {/* ================= BACK TO TOP ================= */}

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
