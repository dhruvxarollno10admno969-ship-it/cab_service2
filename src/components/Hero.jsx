import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
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
  );
}
export default Hero;