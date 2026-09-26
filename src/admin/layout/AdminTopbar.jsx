import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

function AdminTopbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    try{
      await signOut(auth);

      setProfileOpen(false);

      navigate("/admin/login",{
        replace : true,
      });

    }catch (error) {
      console.error ("Logout failed", error);
    }
  };

  return (
    <header className="admin-topbar">

      {/* LEFT */}
      <div className="admin-topbar-left">

        <button
          className="admin-mobile-menu"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={23} strokeWidth={1.8} />
        </button>

        <div className="admin-topbar-brand">
          <span>MANZILL 777</span>
          <strong>Administration</strong>
        </div>

      </div>


      {/* RIGHT */}
      <div className="admin-topbar-right">

        {/* ADMIN PROFILE */}
        <div
          className="admin-profile-wrapper"
          ref={profileRef}
        >

          <button
            className="admin-profile"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >

            <div className="admin-profile-avatar">
              A
            </div>

            <div className="admin-profile-info">
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>

            <ChevronDown
              className={`admin-profile-chevron ${
                profileOpen ? "open" : ""
              }`}
              size={18}
              strokeWidth={1.8}
            />

          </button>


          {/* DROPDOWN */}
          {profileOpen && (
            <div className="admin-profile-dropdown">

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/admin");
                }}
              >
                <User size={17} />
                <span>Dashboard</span>
              </button>

              <button
                className="admin-logout-button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default AdminTopbar;