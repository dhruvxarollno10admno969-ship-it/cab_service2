import { ArrowUpRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "../components/styles/about.css";

const features = [
  {
    number: "01",
    title: "Comfort first.",
    description:
      "Comfortable rides and thoughtful service make every trip feel easier.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "There when you need us.",
    description:
      "From daily commutes to airport transfers, your journey matters to us.",
    icon: Clock3,
  },
  {
    number: "03",
    title: "Travel with confidence.",
    description:
      "A dependable booking experience designed around your convenience.",
    icon: ShieldCheck,
  },
];

function About() {
  return (
    <section className="about-section" id="about">
      {/* HEADING */}
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
          We believe getting from one place to another should feel
          effortless. MANZILL 777 brings together dependable service,
          comfortable rides and a smoother way to travel.
        </p>
      </div>

      {/* BRAND FEATURE SECTION — NO MAP */}
      <div className="about-experience">
        <div className="about-experience-copy">
          <span className="about-mini-label">
            THE WAY WE MOVE
          </span>

          <h3>
            Your time.
            <br />
            Your comfort.
            <br />
            <em>Your journey.</em>
          </h3>

          <p>
            Every journey has a purpose. We make booking your next
            ride simple, so you can focus on what matters at your
            destination.
          </p>

          <Link to="/booking" className="about-inline-link">
            Book your next ride
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="about-experience-visual">
          <div className="about-orb about-orb-one" />
          <div className="about-orb about-orb-two" />

          <div className="about-visual-top">
            <span className="about-live-dot" />
            <span>THE MANZILL EXPERIENCE</span>
          </div>

          <div className="about-visual-brand">
            <span className="about-brand-mark">M</span>

            <div>
              <strong>MANZILL</strong>
              <span>777 · YOUR RIDE, REIMAGINED</span>
            </div>
          </div>

          <div className="about-visual-divider" />

          <div className="about-visual-message">
            <span>FROM PICKUP TO ARRIVAL</span>
            <h4>Make every mile count.</h4>
            <p>
              A better ride starts with a simpler experience.
            </p>
          </div>

          <div className="about-visual-footer">
            <span>COMFORT</span>
            <span className="about-footer-line" />
            <span>CONVENIENCE</span>
            <span className="about-footer-line" />
            <span>CONFIDENCE</span>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="about-features-heading">
        <div>
          <span className="about-mini-label">WHY MANZILL 777</span>
          <h3>Travel, made <em>better.</em></h3>
        </div>

        <p>
          The little details that make a difference to every journey.
        </p>
      </div>

      <div className="about-features">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article className="about-feature-card" key={feature.number}>
              <div className="about-feature-top">
                <span>{feature.number}</span>

                <div className="about-feature-icon">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
              </div>

              <h4>{feature.title}</h4>
              <p>{feature.description}</p>

              <div className="about-feature-bottom">
                <span>MANZILL STANDARD</span>
                <ArrowUpRight size={17} />
              </div>
            </article>
          );
        })}
      </div>

      {/* JOURNEY TIMELINE */}
      <div className="journey-section">
        <div className="journey-heading">
          <span className="about-mini-label">THREE SIMPLE STEPS</span>
          <h3>From here to <em>there.</em></h3>
        </div>

        <div className="journey-line">
          <div className="journey-point active">
            <span className="journey-number">01</span>

            <div className="journey-text">
              <strong>YOU BOOK</strong>
              <p>Choose where you're going.</p>
            </div>
          </div>

          <div className="journey-track">
            <div className="journey-progress" />
          </div>

          <div className="journey-point">
            <span className="journey-number">02</span>

            <div className="journey-text">
              <strong>WE ARRIVE</strong>
              <p>Your ride comes to you.</p>
            </div>
          </div>

          <div className="journey-track">
            <div className="journey-progress" />
          </div>

          <div className="journey-point">
            <span className="journey-number">03</span>

            <div className="journey-text">
              <strong>YOU ARRIVE</strong>
              <p>Ready for what's next.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BRAND STATEMENT AND STATS */}
      <div className="about-bottom">
        <div className="about-statement">
          <span className="about-mini-label">THE MANZILL STANDARD</span>

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
            <span>AVAILABILITY GOAL</span>
          </div>

          <div className="about-stat">
            <strong>100%</strong>
            <span>FOCUSED ON YOU</span>
          </div>

          <div className="about-stat">
            <strong>01</strong>
            <span>SMOOTHER EXPERIENCE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;