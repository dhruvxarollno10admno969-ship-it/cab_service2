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
import QuickBooking from "../components/QuickBooking";
import Service from "../components/Service";
import About from "../components/About";

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

      <section className="hero-section" id="home">
        {/* LEFT — HERO CONTENT */}

        <div className="hero-content">
          <p className="eyebrow">
            <span></span>
            PREMIUM CAB SERVICES
          </p>

          <h1>
            Move smarter.
            <br />
            <span>Ride better.</span>
          </h1>

          <p className="hero-description">
            Reliable rides for everyday journeys, airport transfers,
            business trips and everything in between.
          </p>

          <div className="hero-actions">
            <Link to="/booking" className="primary-button">
              Book a Ride
              <ArrowUpRight size={19} />
            </Link>

            <Link to="/services" className="secondary-button">
              Explore Services
            </Link>
          </div>
        </div>

        {/* RIGHT — QUICK BOOKING */}

        <div className="hero-booking">
          <QuickBooking />
        </div>
      </section>

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

      <section className="fleet-section" id="fleet">
        <div className="fleet-heading">
          <div>
            <p className="eyebrow"></p>

            <h2>
              Choose your
              <br />
              <span>perfect ride.</span>
            </h2>
          </div>

          <p className="fleet-intro">
            From everyday city rides to comfortable long-distance
            journeys, choose the vehicle that fits your trip.
          </p>
        </div>

        {/* =====================================================
            FLEET CARDS
        ===================================================== */}

        <div className="fleet-grid">

          {/* SEDAN */}

          <article className="fleet-card featured">
            <div className="fleet-image">
              <div className="car-placeholder">
                SEDAN
              </div>

              <span className="fleet-tag">
                MOST POPULAR
              </span>
            </div>

            <div className="fleet-info">
              <div>
                <span className="fleet-type">
                  EVERYDAY
                </span>

                <h3>City Sedan</h3>
              </div>

              <span className="fleet-price">
                ₹12<span>/km</span>
              </span>
            </div>

            <p className="fleet-description">
              Comfortable and efficient for everyday city
              journeys and airport transfers.
            </p>

            <div className="fleet-features">
              <span>4 Seats</span>
              <span>AC</span>
              <span>2 Bags</span>
            </div>
          </article>

          {/* SUV */}

          <article className="fleet-card">
            <div className="fleet-image">
              <div className="car-placeholder">
                SUV
              </div>
            </div>

            <div className="fleet-info">
              <div>
                <span className="fleet-type">
                  SPACIOUS
                </span>

                <h3>Comfort SUV</h3>
              </div>

              <span className="fleet-price">
                ₹16<span>/km</span>
              </span>
            </div>

            <p className="fleet-description">
              More space for passengers and luggage without
              compromising comfort.
            </p>

            <div className="fleet-features">
              <span>6 Seats</span>
              <span>AC</span>
              <span>4 Bags</span>
            </div>
          </article>

          {/* PREMIUM */}

          <article className="fleet-card">
            <div className="fleet-image">
              <div className="car-placeholder premium-car">
                PREMIUM
              </div>
            </div>

            <div className="fleet-info">
              <div>
                <span className="fleet-type">
                  EXECUTIVE
                </span>

                <h3>Premium Ride</h3>
              </div>

              <span className="fleet-price">
                ₹22<span>/km</span>
              </span>
            </div>

            <p className="fleet-description">
              A refined ride for business trips, special
              occasions and premium travel.
            </p>

            <div className="fleet-features">
              <span>4 Seats</span>
              <span>AC</span>
              <span>3 Bags</span>
            </div>
          </article>

        </div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section className="contact-section" id="contact">

        <div className="contact-heading">
          <h2>
            Let's get you
            <br />
            <span>moving.</span>
          </h2>
        </div>

        <div className="contact-layout">

          {/* =====================================================
              CONTACT INFO
          ===================================================== */}

          <div className="contact-info">

            <p className="contact-intro">
              Need a ride, have a question, or want to plan a
              trip? We're here to help.
            </p>

            <div className="contact-items">

              {/* PHONE */}

              <a
                href="tel:+919815489193"
                className="contact-item"
              >
                <span className="contact-icon">
                  01
                </span>

                <div>
                  <small>CALL US</small>

                  <strong>
                    +91 98154 89193
                  </strong>
                </div>

                <ArrowUpRight size={18} />
              </a>

              {/* WHATSAPP */}

              <a
                href="https://wa.me/919815489193"
                target="_blank"
                rel="noreferrer"
                className="contact-item"
              >
                <span className="contact-icon">
                  02
                </span>

                <div>
                  <small>WHATSAPP</small>

                  <strong>
                    Chat with us
                  </strong>
                </div>

                <ArrowUpRight size={18} />
              </a>

              {/* EMAIL */}

              <a
                href="mailto:hello@manzill777.com"
                className="contact-item"
              >
                <span className="contact-icon">
                  03
                </span>

                <div>
                  <small>EMAIL</small>

                  <strong>
                    hello@manzill777.com
                  </strong>
                </div>

                <ArrowUpRight size={18} />
              </a>

              {/* OPERATING AREA */}

              <div className="contact-item">
                <span className="contact-icon">
                  04
                </span>

                <div>
                  <small>OPERATING AREA</small>

                  <strong>
                    Chandigarh & Tricity
                  </strong>
                </div>

                <MapPin size={18} />
              </div>

            </div>
          </div>

          {/* =====================================================
              CONTACT / FEEDBACK FORM
          ===================================================== */}

          <form
            className="contact-form"
            onSubmit={handleContactSubmit}
          >

            {/* NAME + PHONE */}

            <div className="form-row">

              <label>
                <span>YOUR NAME</span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>PHONE NUMBER</span>

                <input
                  type="tel"
                  placeholder="+91"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  required
                />
              </label>

            </div>

            {/* EMAIL */}

            <label>
              <span>EMAIL</span>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </label>

            {/* MESSAGE */}

            <label>
              <span>HOW CAN WE HELP?</span>

              <textarea
                rows="5"
                placeholder="Tell us what you need..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                required
              ></textarea>
            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="contact-submit"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Send Message"}

              {!sending && (
                <ArrowUpRight size={19} />
              )}
            </button>

          </form>

        </div>
      </section>
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