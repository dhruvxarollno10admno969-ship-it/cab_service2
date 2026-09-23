import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserRoundCog,
  Car,
  IndianRupee,
  Settings,
  ArrowLeft,
  X,
} from "lucide-react";

import { NavLink, Link } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  const navigation = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      label: "Drivers",
      path: "/admin/drivers",
      icon: UserRoundCog,
    },
    {
      label: "Vehicles",
      path: "/admin/vehicles",
      icon: Car,
    },
    {
      label: "Pricing",
      path: "/admin/pricing",
      icon: IndianRupee,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
  <>
    <aside
      className={`admin-sidebar ${
        isOpen ? "admin-sidebar-open" : ""
      }`}
    >

      {/* BRAND */}

      <div className="admin-sidebar-brand">

        <Link to="/admin" onClick={onClose}>
          <span className="admin-brand-mark">M</span>

          <div className="admin-brand-text">
            <strong>MANZILL</strong>
            <span>ADMIN PANEL</span>
          </div>
        </Link>

        <button
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

      </div>


      {/* NAVIGATION */}

      <nav className="admin-navigation">

        <div className="admin-navigation-label">
          MANAGEMENT
        </div>

        {navigation.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-nav-link ${
                  isActive
                    ? "admin-nav-link-active"
                    : ""
                }`
              }
            >
              <Icon
                size={18}
                strokeWidth={1.8}
              />

              <span>{item.label}</span>

            </NavLink>
          );

        })}

      </nav>


      {/* BOTTOM */}

      <div className="admin-sidebar-bottom">

        <Link
          to="/"
          className="admin-back-website"
          onClick={onClose}
        >
          <ArrowLeft size={17} />

          <span>
            Back to Website
          </span>
        </Link>

        <div className="admin-sidebar-version">

          <span>
            MANZILL 777
          </span>

          <small>
            ADMIN v1.0
          </small>

        </div>

      </div>

    </aside>


    {/* OVERLAY */}

    {isOpen && (
      <div
        className="admin-sidebar-overlay"
        onClick={onClose}
      />
    )}

  </>
);
}

export default AdminSidebar;