import { ArrowUpRight, MapPin, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  return (
    <main>
      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <Link to="/" className="logo">
          <span className="logo-mark">M</span>
          <span>MANZILL 777</span>
        </Link>

        <div className="nav-links">
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/fleet">Fleet</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <Link to="/booking" className="nav-button">
          Book a Ride
          <ArrowUpRight size={18} />
        </Link>

        <button className="menu-button">
          <Menu size={24} />
        </button>
      </nav>

      {/* ================= HERO ================= */}

      <section className="hero-section">
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

        {/* ================= BOOKING CARD ================= */}

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
    </main>
  );
}


/* ================= SERVICE CARD ================= */

function ServiceCard({ number, title, description }) {
  return (
    <article className="service-card">
      <span className="service-number">{number}</span>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <ArrowUpRight className="service-arrow" size={22} />
    </article>
  );
}

export default Home;