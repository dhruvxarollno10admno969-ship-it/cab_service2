import {
  ArrowUpRight,
  MapPin,
  Menu,
  ShieldCheck,
  Clock3,
  Car,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";
import RealMap from "../components/RealMap";
function Home() {
  return (
    <main>
      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-mark">M</span>
          <span>MANZILL 777</span>
        </a>

        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#fleet">Fleet</a>
          <a href="#contact">Contact</a>
        </div>

        <Link to="/booking" className="nav-button">
          Book a Ride
          <ArrowUpRight size={18} />
        </Link>

        <button className="menu-button" type="button">
          <Menu size={24} />
        </button>
      </nav>

      {/* ================= HERO ================= */}

      <section className="hero-section" id="home">
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

            <a href="#services" className="secondary-button">
              Explore Services
            </a>
          </div>
        </div>

        {/* ================= QUICK BOOKING ================= */}

        <div className="booking-card">
          <div className="booking-header">
            <div>
              <span>QUICK BOOKING</span>
              <h2>Where are you going?</h2>
            </div>

            <MapPin size={22} />
          </div>

          <div className="location-input">
            <span className="input-dot pickup"></span>

            <div>
              <small>Pickup</small>
              <p>Enter pickup location</p>
            </div>
          </div>

          <div className="location-line"></div>

          <div className="location-input">
            <span className="input-dot destination"></span>

            <div>
              <small>Destination</small>
              <p>Where do you want to go?</p>
            </div>
          </div>

          <Link to="/booking" className="booking-button">
            Find a Ride
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* ================= SERVICES ================= */}

      <section className="services-section" id="services">
        <div className="section-heading">
          <p className="eyebrow">
            <span></span>
            01 — SERVICES
          </p>

          <h2>
            One platform.
            <br />
            <span>Every journey.</span>
          </h2>
        </div>

        <div className="services-grid">
          <ServiceCard
            number="01"
            title="City Rides"
            description="Quick and comfortable rides for your everyday journeys."
          />

          <ServiceCard
            number="02"
            title="Airport Transfers"
            description="On-time airport pickups and drop-offs without the stress."
          />

          <ServiceCard
            number="03"
            title="Outstation"
            description="Travel beyond the city with comfortable long-distance rides."
          />

          <ServiceCard
            number="04"
            title="Corporate"
            description="Professional transportation for businesses and teams."
          />
        </div>
      </section>


   {/* ================= ABOUT ================= */}

<section className="about-section" id="about">
  <div className="about-top">
    <p className="eyebrow">
      <span></span>
      02 — ABOUT US
    </p>

    <span className="about-label">MANZILL 777 / EST. 2026</span>
  </div>

  <div className="about-title">
    <h2>
      More than a ride.
      <br />
      <span>It's your journey.</span>
    </h2>

    <p>
      We believe getting from one place to another should feel effortless.
      MANZILL 777 combines dependable drivers, comfortable vehicles and
      thoughtful service to make every kilometre count.
    </p>
  </div>
{/* ABOUT VISUAL */}

<div className="about-visual">

  <RealMap />

  <div className="location-card pickup-card">
    <span className="card-dot"></span>

    <div>
      <small>PICKUP</small>
      <strong>Your location</strong>
    </div>
  </div>

  <div className="location-card destination-card">
    <MapPin size={17} />

    <div>
      <small>DESTINATION</small>
      <strong>Your destination</strong>
    </div>
  </div>

</div>


  {/* Journey line */}

  <div className="journey-line">
    <div className="journey-point active">
      <span>01</span>
      <div>
        <strong>YOU BOOK</strong>
        <p>Choose where you're going.</p>
      </div>
    </div>

    <div className="journey-track">
      <div className="journey-progress"></div>
    </div>

    <div className="journey-point">
      <span>02</span>
      <div>
        <strong>WE ARRIVE</strong>
        <p>Your driver comes to you.</p>
      </div>
    </div>

    <div className="journey-track">
      <div className="journey-progress"></div>
    </div>

    <div className="journey-point">
      <span>03</span>
      <div>
        <strong>YOU ARRIVE</strong>
        <p>Comfortably at your destination.</p>
      </div>
    </div>
  </div>

  {/* Stats */}

  <div className="about-bottom">
    <div className="about-statement">
      <span>THE MANZILL STANDARD</span>

      <h3>
        Every journey
        <br />
        deserves to be
        <br />
        <em>better.</em>
      </h3>
    </div>

    <div className="about-stats">
      <div className="about-stat">
        <strong>24/7</strong>
        <span>AVAILABLE</span>
      </div>

      <div className="about-stat">
        <strong>100%</strong>
        <span>FOCUSED ON YOU</span>
      </div>

      <div className="about-stat">
        <strong>1</strong>
        <span>SMOOTH EXPERIENCE</span>
      </div>
    </div>
  </div>

  <div className="about-cta">
    <p>
      Wherever you're headed,
      <br />
      we'll help you get there.
    </p>

    <Link to="/booking" className="about-cta-button">
      Start Your Journey
      <ArrowUpRight size={19} />
    </Link>
  </div>
</section>

{/* ================= FLEET ================= */}

<section className="fleet-section" id="fleet">

  <div className="fleet-heading">
    <div>
      <p className="eyebrow">
        <span></span>
        03 — OUR FLEET
      </p>

      <h2>
        Choose your
        <br />
        <span>perfect ride.</span>
      </h2>
    </div>

    <p className="fleet-intro">
      From everyday city rides to comfortable
      long-distance journeys, choose the vehicle
      that fits your trip.
    </p>
  </div>


  {/* FLEET CARDS */}

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
        Comfortable and efficient for everyday
        city journeys and airport transfers.
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
        More space for passengers and luggage
        without compromising comfort.
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
        A refined ride for business trips,
        special occasions and premium travel.
      </p>

      <div className="fleet-features">
        <span>4 Seats</span>
        <span>AC</span>
        <span>3 Bags</span>
      </div>

    </article>

  </div>

</section>
     {/* ================= CONTACT ================= */}

<section className="contact-section" id="contact">

  <div className="contact-heading">

    <p className="eyebrow">
      <span></span>
      04 — CONTACT
    </p>

    <h2>
      Let's get you
      <br />
      <span>moving.</span>
    </h2>

  </div>


  <div className="contact-layout">

    {/* CONTACT INFO */}

    <div className="contact-info">

      <p className="contact-intro">
        Need a ride, have a question, or want to
        plan a trip? We're here to help.
      </p>


      <div className="contact-items">

        <a href="tel:+919876543210" className="contact-item">
          <span className="contact-icon">01</span>

          <div>
            <small>CALL US</small>
            <strong>+91 98765 43210</strong>
          </div>

          <ArrowUpRight size={18} />
        </a>


        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <span className="contact-icon">02</span>

          <div>
            <small>WHATSAPP</small>
            <strong>Chat with us</strong>
          </div>

          <ArrowUpRight size={18} />
        </a>


        <a
          href="mailto:hello@manzill777.com"
          className="contact-item"
        >
          <span className="contact-icon">03</span>

          <div>
            <small>EMAIL</small>
            <strong>hello@manzill777.com</strong>
          </div>

          <ArrowUpRight size={18} />
        </a>


        <div className="contact-item">
          <span className="contact-icon">04</span>

          <div>
            <small>OPERATING AREA</small>
            <strong>Chandigarh & Tricity</strong>
          </div>

          <MapPin size={18} />
        </div>

      </div>

    </div>


    {/* CONTACT FORM */}

    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thanks! We'll contact you shortly.");
      }}
    >

      <div className="form-row">

        <label>
          <span>YOUR NAME</span>

          <input
            type="text"
            placeholder="Enter your name"
            required
          />
        </label>


        <label>
          <span>PHONE NUMBER</span>

          <input
            type="tel"
            placeholder="+91"
            required
          />
        </label>

      </div>


      <label>
        <span>EMAIL</span>

        <input
          type="email"
          placeholder="you@example.com"
        />
      </label>


      <label>
        <span>HOW CAN WE HELP?</span>

        <textarea
          rows="5"
          placeholder="Tell us what you need..."
          required
        ></textarea>
      </label>


      <button
        type="submit"
        className="contact-submit"
      >
        Send Message
        <ArrowUpRight size={19} />
      </button>

    </form>

  </div>


  {/* CONTACT BOTTOM */}

  <div className="contact-bottom">

    <span>
      AVAILABLE 24 / 7
    </span>

    <span>
      MANZILL 777
    </span>

    <span>
      EVERY JOURNEY MATTERS.
    </span>

  </div>

</section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <div className="logo">
          <span className="logo-mark">M</span>
          <span>MANZILL 777</span>
        </div>

        <p>Reliable rides. Every journey.</p>

        <a href="#home" className="footer-top">
          Back to top
          <ArrowUpRight size={17} />
        </a>
      </footer>
    </main>
  );
}


/* ================= SERVICE CARD ================= */

function ServiceCard({ number, title, description }) {
  return (
    <Link to="/booking" className="service-card">
      <span className="service-number">{number}</span>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <ArrowUpRight className="service-arrow" size={22} />
    </Link>
  );
}


/* ================= FLEET CARD ================= */

function FleetCard({ icon, title, description, seats }) {
  return (
    <div className="fleet-card">
      <div className="fleet-icon">{icon}</div>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <span>{seats}</span>
    </div>
  );
}


/* ================= FEATURE CARD ================= */

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

export default Home;