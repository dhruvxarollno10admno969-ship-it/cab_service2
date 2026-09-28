import { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  ShieldCheck,
  User,
  Mail,
  CalendarDays,
  Clock3,
  Copy,
  Check,
} from "lucide-react";

import { collection, getDocs } from "firebase/firestore";

import { db } from "../../firebase";

import "../styles/Authentication.css";

const Authentication = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [copiedUid, setCopiedUid] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  // ==========================================
  // FETCH AUTHENTICATION DATA
  // ==========================================

  useEffect(() => {
    const fetchAuthenticationData = async () => {
      try {
        setLoading(true);

        const usersRef = collection(db, "users");

        const snapshot = await getDocs(usersRef);

        const authenticationUsers = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,

            email: data.email || "—",

            provider: data.provider || data.providers || "—",

            createdAt: data.createdAt || data.created || null,

            lastSignIn: data.lastSignIn || data.signedIn || null,

            uid: data.uid || doc.id,
          };
        });

        setUsers(authenticationUsers);
      } catch (error) {
        console.error("Authentication data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthenticationData();
  }, []);

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      let value = date;

      // Firestore Timestamp
      if (typeof date === "object" && date.seconds) {
        value = new Date(date.seconds * 1000);
      }

      // Firebase Timestamp-like object
      else if (typeof date === "object" && typeof date.toDate === "function") {
        value = date.toDate();
      }

      // String / Date
      else {
        value = new Date(date);
      }

      if (isNaN(value.getTime())) {
        return "—";
      }

      return value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // ==========================================
  // COPY UID
  // ==========================================

  const copyUid = async (uid) => {
    try {
      await navigator.clipboard.writeText(uid);

      setCopiedUid(uid);

      setTimeout(() => {
        setCopiedUid(null);
      }, 1500);
    } catch (error) {
      console.error("Copy UID error:", error);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      user.email?.toLowerCase().includes(searchValue) ||
      user.uid?.toLowerCase().includes(searchValue) ||
      String(user.provider).toLowerCase().includes(searchValue)
    );
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="authentication-page">
        <div className="authentication-loading">
          <div className="authentication-loader" />

          <p>Loading authentication data...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="authentication-page">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="authentication-header">
        <div>
          <span className="authentication-eyebrow">SECURITY</span>

          <h1>Authentication</h1>

          <p>Manage and view registered user authentication information.</p>
        </div>

        <div className="authentication-total">
          <ShieldCheck size={18} />

          <span>{users.length} Users</span>
        </div>
      </div>

      {/* ======================================
          TOOLBAR
      ====================================== */}

      <div className="authentication-toolbar">
        <div className="authentication-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search email, UID or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="authentication-table-wrapper">
        <table className="authentication-table">
          <thead>
            <tr>
              <th>IDENTIFIER</th>

              <th>PROVIDERS</th>

              <th>CREATED</th>

              <th>SIGNED IN</th>

              <th>USER UID</th>

              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="authentication-empty">
                  <User size={25} />

                  <span>No authentication users found.</span>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/* IDENTIFIER */}

                  <td>
                    <div className="auth-identifier">
                      <div className="auth-avatar">
                        {user.email?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <strong>{user.email}</strong>

                        <span>Firebase account</span>
                      </div>
                    </div>
                  </td>

                  {/* PROVIDER */}

                  <td>
                    <span className="provider-badge">
                      <ShieldCheck size={14} />

                      {user.provider}
                    </span>
                  </td>

                  {/* CREATED */}

                  <td>
                    <div className="auth-date">
                      <CalendarDays size={15} />

                      {formatDate(user.createdAt)}
                    </div>
                  </td>

                  {/* SIGNED IN */}

                  <td>
                    <div className="auth-date">
                      <Clock3 size={15} />

                      {formatDate(user.lastSignIn)}
                    </div>
                  </td>

                  {/* UID */}

                  <td>
                    <div className="auth-uid">
                      <code>{user.uid}</code>

                      <button
                        type="button"
                        onClick={() => copyUid(user.uid)}
                        title="Copy UID"
                      >
                        {copiedUid === user.uid ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* ACTIONS */}

                  <td>
                    <div className="auth-actions">
                      <button
                        type="button"
                        className="auth-more"
                        onClick={() =>
                          setOpenMenu(openMenu === user.id ? null : user.id)
                        }
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === user.id && (
                        <div className="auth-menu">
                          <button
                            type="button"
                            onClick={() => copyUid(user.uid)}
                          >
                            Copy UID
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Authentication;
