import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Title from "./Title";
import "../styles/Title.css";
import "../styles/about.css";

const stats = [
  { value: "24/7", label: "Ride booking" },
  { value: "100%", label: "Customer focus" },
  { value: "1", label: "Simple booking process" },
];

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-main">
          <div className="about-content">
            <Title
              className="about-heading"
              label="ABOUT MANZILL 777"
              title="More than a ride."
              highlight="It's your journey."
              description="At MANZILL 777, we make travelling simple, comfortable, and reliable. Whether it’s your daily commute, an airport transfer, or an outstation trip, we’re here to help you get where you need to go."
              align="left"
            />

            <p className="about-description about-description-secondary">
              Easy booking, comfortable rides, and service
              you can count on — every journey matters.
            </p>

            <Link to="/booking" className="about-cta-button">
              Book a Ride
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="about-image-wrapper">
            <img
              src="/images/car.jpg"
              alt="Premium black car for MANZILL 777"
              className="about-image"
              loading="lazy"
            />
            <div className="about-image-glow" />
          </div>
        </div>

        <div className="about-stats">
          {stats.map((stat) => (
            <div className="about-stat" key={stat.label}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="about-divider" />
      </div>
    </section>
  );
}

export default About;