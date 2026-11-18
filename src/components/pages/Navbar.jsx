
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
  ShieldCheck,
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

import { auth } from "../../firebase";
import "../styles/navbar.css";

// Admin account
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ================= FIREBASE AUTH =================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // ================= ADMIN CHECK =================

  const isAdmin =
    !!ADMIN_EMAIL &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ================= MENU HELPERS =================

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // ================= SECTION NAVIGATION =================

  const handleSectionClick = (event, sectionId) => {
    event.preventDefault();

    closeMenu();

    const hash = `#${sectionId}`;

    // Already on homepage
    if (location.pathname === "/") {
      if (location.hash !== hash) {
        navigate({ pathname: "/", hash });
      } else {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // Navigate to homepage with section hash
    navigate({
      pathname: "/",
      hash,
    });
  };

  // ================= CLOSE MENUS ON ROUTE CHANGE =================

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // ================= SCROLL TO SECTION =================

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

  // ================= LOGOUT =================

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenu();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ================= ADMIN NAVIGATION =================

  const handleAdminNavigation = () => {
    closeMenu();
    navigate("/admin");
  };

  // ================= PROFILE AVATAR =================

  const avatarLetter =
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  // ================= SECTION LINK HELPER =================

  const SectionLink = ({ section, children, mobile = false }) => (
    <a
      href={`/#${section}`}
      onClick={(event) => handleSectionClick(event, section)}
    >
      {children}
    </a>
  );

  return (
    <header className="navbar">
      {/* ================= LOGO ================= */}

      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMenu}
      >
        <span className="logo-mark">M</span>

        <div className="logo-text">
          <span>MANZILL</span>
          <small>77</small>
        </div>
      </Link>

      {/* ================= DESKTOP NAVIGATION ================= */}

      <nav className="navbar-links">
        <Link
          to="/"
          className={isActive("/") ? "active" : ""}
        >
          Home
        </Link>

        <SectionLink section="services">Services</SectionLink>
        <SectionLink section="fleet">Fleet</SectionLink>
        <SectionLink section="about">About</SectionLink>
        <SectionLink section="testimonials">Rating</SectionLink>
        <SectionLink section="contact">Contact</SectionLink>
      </nav>

      {/* ================= DESKTOP ACTIONS ================= */}

      <div className="navbar-actions">
        {!user ? (
          <>
            <Link to="/login" className="navbar-login">
              Login
            </Link>

            <Link to="/signup" className="navbar-signup">
              Signup
            </Link>
          </>
        ) : (
          <div className="profile-wrapper">
            {/* PROFILE BUTTON */}

            <button
              type="button"
              className="profile-button"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="profile-avatar">
                {avatarLetter}
              </span>

              <span className="profile-name">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className={profileOpen ? "rotate-icon" : ""}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar large">
                    {avatarLetter}
                  </div>

                  <div className="profile-user-info">
                    <strong>{displayName}</strong>
                    <span>{user.email}</span>

                    {isAdmin && (
                      <small className="admin-role-label">
                        Administrator
                      </small>
                    )}
                  </div>
                </div>

                <div className="profile-divider" />

                {/* ADMIN MENU */}

                {isAdmin ? (
                  <button
                    type="button"
                    className="profile-item admin-panel-item"
                    onClick={handleAdminNavigation}
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Panel</span>
                    <ArrowUpRight
                      size={16}
                      className="admin-panel-arrow"
                    />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="profile-item"
                      onClick={closeMenu}
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-rides"
                      className="profile-item"
                      onClick={closeMenu}
                    >
                      <Car size={18} />
                      <span>My Rides</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="profile-item"
                      onClick={closeMenu}
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                  </>
                )}

                <div className="profile-divider" />

                {/* LOGOUT */}

                <button
                  type="button"
                  className="profile-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MOBILE MENU BUTTON ================= */}

      <button
        type="button"
        className="navbar-menu"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((open) => !open);
          setProfileOpen(false);
        }}
      >
        {menuOpen ? <X size={25} /> : <Menu size={25} />}
      </button>

      {/* ================= RESPONSIVE MOBILE MENU ================= */}

      {menuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav-links">
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>

            <SectionLink section="services">Services</SectionLink>
            <SectionLink section="fleet">Fleet</SectionLink>
            <SectionLink section="about">About</SectionLink>
            <SectionLink section="testimonials">Rating</SectionLink>
            <SectionLink section="contact">Contact</SectionLink>
          </nav>

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
                  className="navbar-signup"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                {/* MOBILE ACCOUNT INFO */}

                <div className="mobile-account-info">
                  <span className="profile-avatar">
                    {avatarLetter}
                  </span>

                  <div>
                    <strong>{displayName}</strong>
                    <span>
                      {isAdmin ? "Administrator" : user.email}
                    </span>
                  </div>
                </div>

                {/* ADMIN MOBILE MENU */}

                {isAdmin ? (
                  <button
                    type="button"
                    className="mobile-menu-item admin-mobile-button"
                    onClick={handleAdminNavigation}
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Panel</span>
                    <ArrowUpRight size={16} />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="mobile-menu-item"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-rides"
                      onClick={closeMenu}
                      className="mobile-menu-item"
                    >
                      <Car size={18} />
                      <span>My Rides</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={closeMenu}
                      className="mobile-menu-item"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-menu-item logout-item"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
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
