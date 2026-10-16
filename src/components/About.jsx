
import {
  ArrowUpRight,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";
import "../components/styles/about.css";

const benefits = [
  {
    number: "01",
    title: "Comfortable journeys",
    description:
      "A comfortable travel experience for everyday rides and longer journeys.",
    icon: Sparkles,
    label: "COMFORT",
  },
  {
    number: "02",
    title: "Simple booking",
    description:
      "Plan your pickup and destination through a straightforward booking process.",
    icon: Clock3,
    label: "CONVENIENCE",
  },
  {
    number: "03",
    title: "Travel with confidence",
    description:
      "Find ride options for city travel, airport transfers, and other destinations.",
    icon: ShieldCheck,
    label: "YOUR JOURNEY",
  },
];

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* LEFT: ABOUT CONTENT */}
        <div className="about-content">
          <p className="about-eyebrow">
            <span />
            ABOUT MANZILL 77
          </p>

          <h2>
            More than a ride.
            <br />
            <span>It's your journey.</span>
          </h2>

          <p className="about-description">
            At MANZILL 77, we believe getting from one
            place to another should feel simple and
            comfortable. From everyday city rides to
            airport transfers and longer journeys, we're
            here to make your travel experience easier.
          </p>

          <Link to="/booking" className="about-button">
            Book Your Ride
            <ArrowUpRight size={18} />
          </Link>

          <div className="about-availability">
            <span className="about-availability-dot" />
            <span>BOOKING ACCESS · 24/7</span>
          </div>
        </div>

        {/* RIGHT: THREE BENEFITS */}
        <div className="about-details">
          <div className="about-details-heading">
            <span className="about-mini-label">
              THE MANZILL EXPERIENCE
            </span>

            <p>
              Thoughtful travel. Simple booking.
              A better journey.
            </p>
          </div>

          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                className="about-detail"
                key={benefit.number}
              >
                <div className="about-detail-top">
                  <span className="about-detail-number">
                    {benefit.number}
                  </span>
                </div>

                <h3>{benefit.title}</h3>

                <p>{benefit.description}</p>

                <div className="about-detail-bottom">
                  <span>{benefit.label}</span>
                  <ArrowUpRight size={16} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: SERVICE HIGHLIGHTS */}
      <div className="about-highlights">
        <div className="about-highlight-intro">
          <span className="about-mini-label">
            MADE FOR YOUR JOURNEY
          </span>

          <p>
            One destination at a time.
            <br />
            <span>Your journey matters.</span>
          </p>
        </div>

        <div className="about-highlight">
          <span className="about-highlight-number">01</span>
          <span>City rides</span>
        </div>

        <div className="about-highlight">
          <span className="about-highlight-number">02</span>
          <span>Airport transfers</span>
        </div>

        <div className="about-highlight">
          <span className="about-highlight-number">03</span>
          <span>Long-distance travel</span>
        </div>
      </div>
    </section>
  );
}

export default About;
