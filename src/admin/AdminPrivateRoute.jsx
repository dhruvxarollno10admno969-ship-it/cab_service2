
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || ""
).trim().toLowerCase();

function AdminPrivateRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="admin-auth-loading">
        Checking admin access...
      </div>
    );
  }

  // No Firebase login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin email configuration missing
  if (!ADMIN_EMAIL) {
    console.error("VITE_ADMIN_EMAIL is missing from .env");
    return <Navigate to="/admin/login" replace />;
  }

  // Verify admin email
  const userEmail = (user.email || "").trim().toLowerCase();

  if (userEmail !== ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authorized admin
  return <Outlet />;
}

export default AdminPrivateRoute;
