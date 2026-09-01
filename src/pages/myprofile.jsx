import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import "../App.css";


function Profile() {

  const [user, setUser] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {

        if (!currentUser) {
          navigate("/login");
          return;
        }

        setUser(currentUser);

      }
    );

    return () => unsubscribe();

  }, [navigate]);


  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");

  };


  if (!user) {
    return null;
  }


  const username =
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";


  const initial =
    username.charAt(0).toUpperCase();


  return (

    <main className="profile-page">

      <div className="profile-card">


        {/* BACK */}

        <Link
          to="/"
          className="profile-back"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>


        {/* PROFILE */}

        <div className="profile-main">

          <div className="profile-page-avatar">

            {user.photoURL ? (

              <img
                src={user.photoURL}
                alt="Profile"
              />

            ) : (

              initial

            )}

          </div>


          <h1>
            {username}
          </h1>

          <p>
            {user.email}
          </p>

        </div>


        {/* INFORMATION */}

        <div className="profile-info">


          <div className="profile-info-item">

            <div className="profile-info-icon">
              <User size={19} />
            </div>

            <div>

              <span>
                Name
              </span>

              <strong>
                {username}
              </strong>

            </div>

          </div>


          <div className="profile-info-item">

            <div className="profile-info-icon">
              <Mail size={19} />
            </div>

            <div>

              <span>
                Email
              </span>

              <strong>
                {user.email}
              </strong>

            </div>

          </div>


          <div className="profile-info-item">

            <div className="profile-info-icon">
              <Calendar size={19} />
            </div>

            <div>

              <span>
                Account Created
              </span>

              <strong>
                {user.metadata?.creationTime
                  ? new Date(
                      user.metadata.creationTime
                    ).toLocaleDateString()
                  : "—"}
              </strong>

            </div>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="profile-page-actions">

          <button
            className="profile-logout"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      </div>

    </main>

  );
}

export default Profile;