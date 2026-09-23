import {
  Search,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

function AdminTopbar({ onMenuClick }) {
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

        {/* SEARCH */}
        <button
          className="admin-topbar-icon"
          aria-label="Search"
        >
          <Search size={22} strokeWidth={1.8} />
        </button>

        {/* NOTIFICATIONS */}
        <button
          className="admin-topbar-icon admin-notification"
          aria-label="Notifications"
        >
          <Bell size={22} strokeWidth={1.8} />

          <span className="admin-notification-dot"></span>
        </button>

        {/* PROFILE */}
        <button className="admin-profile">

          <div className="admin-profile-avatar">
            A
          </div>

          <div className="admin-profile-info">
            <strong>Administrator</strong>
            <span>Admin</span>
          </div>

          <ChevronDown
            className="admin-profile-chevron"
            size={18}
            strokeWidth={1.8}
          />

        </button>

      </div>

    </header>
  );
}

export default AdminTopbar;