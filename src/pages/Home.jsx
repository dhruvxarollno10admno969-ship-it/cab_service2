import { useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import "../App.css";
import QuickBooking from "../components/pages/QuickBooking";
import Service from "../components/pages/Service";
import About from "../components/pages/About";
import Testimonials from "../components/pages/Testimonials";
import Hero from "../components/pages/Hero";
import Fleet from "./Fleet";
import Contact from "./Contact";

function Home() {
  // =====================================================
  // CONTACT FORM STATES
  // =====================================================

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  // =====================================================
  // CONTACT FORM SUBMIT
  // =====================================================

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    try {
      setSending(true);

      // Send data to Firebase Firestore
     await addDoc(collection(db, "feedback"), {
  name: name.trim(),
  phone: phone.trim(),
  email: email.trim(),
  message: message.trim(),
  status: "pending",
  createdAt: serverTimestamp(),
});

      // Success message
      alert("Thanks! We'll contact you shortly.");

      // Clear form
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Feedback submission error:", error);

      alert(
        `Firebase Error: ${error.code || error.message}`
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero/>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <Service />

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <About />

      {/* =====================================================
          FLEET
      ===================================================== */}

      <Fleet />


          
      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}

      <Testimonials />

      {/* =====================================================
          CONTACT
      ===================================================== */}
      <Contact />
      
    </main>
  );
}

/* =====================================================
   SERVICE CARD
===================================================== */

function ServiceCard({
  number,
  title,
  description,
}) {
  return (
    <Link
      to="/booking"
      className="service-card"
    >
      <span className="service-number">
        {number}
      </span>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <ArrowUpRight
        className="service-arrow"
        size={22}
      />
    </Link>
  );
}

/* =====================================================
   FLEET CARD
===================================================== */

function FleetCard({
  icon,
  title,
  description,
  seats,
}) {
  return (
    <div className="fleet-card">

      <div className="fleet-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <span>{seats}</span>

    </div>
  );
}

/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

    </div>
  );
}

export default Home;