import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import LightPillar from "./Lightpillar";
import QuickBooking from "./QuickBooking";
import Title from "./Title";
import "../styles/Title.css"

function Hero() {
  return (
    <section className="hero-wrapper" id="home">
      {/* LIGHT PILLAR BACKGROUND */}
      <div className="hero-pillar" aria-hidden="true">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={0.85}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* DARK OVERLAY */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* HERO CONTENT */}
      <div className="hero-section">
        {/* LEFT CONTENT */}
        <div className="hero-content">
          <Title
            className="hero-title"
            label="PREMIUM CAB SERVICES"
            title="Move smarter."
            highlight="Ride better."
            description="Reliable rides for everyday journeys, airport transfers, business trips and everything in between."
            align="left"
          />

          {/* CTA */}
          <div className="hero-actions">
            <Link to="/booking" className="primary-button">
              <span>Book a Ride</span>
              <ArrowUpRight size={19} />
            </Link>
          </div>

          {/* TRUST INDICATORS */}
          <div className="hero-trust">
            <div className="trust-item">
              <strong>24/7</strong>
              <span>Availability</span>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <strong>Safe</strong>
              <span>Professional rides</span>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <strong>Fast</strong>
              <span>Easy booking</span>
            </div>
          </div>
        </div>

        {/* QUICK BOOKING */}
        <QuickBooking />
      </div>
    </section>
  );
}

export default Hero;
