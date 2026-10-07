import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import LightPillar from "./Lightpillar.jsx";

function Hero() {
  return (
    <section className="hero-wrapper">

      {/* =========================================
          LIGHT PILLAR
          Full strength in Hero
          Fades at bottom
      ========================================= */}

      <div className="hero-pillar">

        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
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


      {/* =========================================
          HERO CONTENT
      ========================================= */}

      <section
        className="hero-section"
        id="home"
      >

        {/* =====================================
            HERO LEFT
        ===================================== */}

        <div className="hero-content">

          <p className="eyebrow">
            <span></span>
            PREMIUM CAB SERVICES
          </p>


          <h1>
            Move smarter.
            <br />

            <span>
              Ride better.
            </span>
          </h1>


          <p className="hero-description">
            Reliable rides for everyday journeys,
            airport transfers, business trips and
            everything in between.
          </p>


          <div className="hero-actions">

            <Link
              to="/booking"
              className="primary-button"
            >
              <span>
                Book a Ride
              </span>

              <ArrowUpRight size={19} />
            </Link>

          </div>

        </div>


        {/* =====================================
            QUICK BOOKING
        ===================================== */}

        <div className="booking-card">

          <div className="booking-header">

            <div>

              <span>
                QUICK BOOKING
              </span>

              <h2>
                Where are you going?
              </h2>

            </div>


            <MapPin size={22} />

          </div>


          {/* PICKUP */}

          <div className="location-input">

            <span className="input-dot pickup"></span>

            <div>

              <small>
                Pickup
              </small>

              <p>
                Enter pickup location
              </p>

            </div>

          </div>


          <div className="location-line"></div>


          {/* DESTINATION */}

          <div className="location-input">

            <span className="input-dot destination"></span>

            <div>

              <small>
                Destination
              </small>

              <p>
                Where do you want to go?
              </p>

            </div>

          </div>


          {/* BOOKING BUTTON */}

          <Link
            to="/booking"
            className="booking-button"
          >
            Find a Ride

            <ArrowUpRight size={18} />

          </Link>

        </div>

      </section>

    </section>
  );
}

export default Hero;
