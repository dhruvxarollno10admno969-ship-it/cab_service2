
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import RealMap from "./RealMap";
import "../components/styles/about.css";

function About() {
  return (
    <section className="about-section" id="about">
      {/* Heading */}
      <div className="about-heading">
        <div className="about-heading-content">
          <p className="about-eyebrow">
            <span />
            02 — ABOUT US
          </p>

          <h2>
            More than a ride.
            <br />
            <span>It's your journey.</span>
          </h2>
        </div>

        <p className="about-description">
          We believe getting from one place to another should feel effortless.
          MANZILL 777 combines dependable drivers, comfortable vehicles and
          thoughtful service to make every kilometre count.
        </p>
      </div>

      {/* Interactive map */}
      <div className="about-visual">
        <div className="real-map">
          <RealMap />
        </div>

        <div className="about-map-glow" />

        <div className="about-map-label">
          <span>YOUR JOURNEY, OUR PRIORITY</span>
          <strong>Every destination matters.</strong>
        </div>
      </div>

      {/* Journey timeline */}
      <div className="journey-line">
        <div className="journey-point active">
          <span>01</span>
          <div className="journey-text">
            <strong>YOU BOOK</strong>
            <p>Choose where you're going.</p>
          </div>
        </div>

        <div className="journey-track">
          <div className="journey-progress" />
        </div>

        <div className="journey-point">
          <span>02</span>
          <div className="journey-text">
            <strong>WE ARRIVE</strong>
            <p>Your driver comes to you.</p>
          </div>
        </div>

        <div className="journey-track">
          <div className="journey-progress" />
        </div>

        <div className="journey-point">
          <span>03</span>
          <div className="journey-text">
            <strong>YOU ARRIVE</strong>
            <p>Comfortably at your destination.</p>
          </div>
        </div>
      </div>

      {/* Brand statement and statistics */}
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

      {/* Booking CTA */}
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
  );
}

export default About;

