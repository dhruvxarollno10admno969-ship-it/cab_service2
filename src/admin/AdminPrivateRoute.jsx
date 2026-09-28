import { Navigate, Outlet } from "react-router-dom";

import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase";


const ADMIN_EMAIL = "admin@gmail.com";


function AdminPrivateRoute() {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);

          setLoading(false);

        }
      );


    return () => unsubscribe();

  }, []);


  // =====================================================
  // CHECKING FIREBASE
  // =====================================================

  if (loading) {

    return (
      <div className="admin-auth-loading">
        Checking access...
      </div>
    );

  }


  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  // =====================================================
  // LOGGED IN BUT NOT ADMIN
  // =====================================================

  if (user.email !== ADMIN_EMAIL) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  // =====================================================
  // ADMIN VERIFIED
  // =====================================================

  return <Outlet />;
}


export default AdminPrivateRoute;