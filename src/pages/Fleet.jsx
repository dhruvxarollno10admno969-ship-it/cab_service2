
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ArrowUpRight,
  Users,
  BriefcaseBusiness,
  CarFront,
} from "lucide-react";
import { Link } from "react-router-dom";

import { db } from "../firebase";
import Title from "../components/pages/Title";
import "./fleet.css";
import "../components/styles/Title.css";

function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const vehiclesRef = collection(db, "vehicles");

    const unsubscribe = onSnapshot(
      vehiclesRef,
      (snapshot) => {
        setVehicles(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );

        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Fleet Firestore error:", firebaseError);
        setError("Unable to load vehicles. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="fleet-page" id="fleet">
      <section className="fleet-section">
        <Title
          className="fleet-heading"
          label="MANZILL 777 / OUR FLEET"
          title="Find your"
          highlight="perfect ride."
          description="From everyday city rides to premium long-distance journeys, travel your way with MANZILL 777. Comfort, space and reliability for wherever your journey takes you."
          align="left"
        />

        {loading && (
          <div className="fleet-message">
            Loading our fleet...
          </div>
        )}

        {!loading && error && (
          <div className="fleet-message fleet-error">
            {error}
          </div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <div className="fleet-message">
            <CarFront size={38} />
            <h2>Our fleet is getting ready.</h2>
            <p>
              New vehicles will appear here when they are added
              through the MANZILL 777 admin panel.
            </p>
          </div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="fleet-grid">
            {vehicles.map((vehicle, index) => (
              <article
                className={`fleet-card ${
                  index === 0 ? "featured" : ""
                }`}
                key={vehicle.id}
              >
                <div className="fleet-image">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name || "MANZILL vehicle"}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="fleet-image-placeholder">
                      <CarFront size={64} />
                      <span>{vehicle.type || "Vehicle"}</span>
                    </div>
                  )}

                  {vehicle.category && (
                    <span className="fleet-tag">
                      {vehicle.category}
                    </span>
                  )}

                  <span className="fleet-image-number">777</span>
                </div>

                <div className="fleet-info">
                  <div className="fleet-title-group">
                    <span className="fleet-type">
                      MANZILL COLLECTION
                    </span>
                    <h2>{vehicle.name || vehicle.type || "Vehicle"}</h2>
                  </div>

                  <p className="fleet-price">
                    ₹{vehicle.pricePerKm ?? vehicle.price ?? 0}
                    <span>/ km</span>
                  </p>
                </div>

                {vehicle.description && (
                  <p className="fleet-description">
                    {vehicle.description}
                  </p>
                )}

                <div className="fleet-features">
                  <span>
                    <Users size={15} />
                    {vehicle.passengers ?? "—"} Passengers
                  </span>

                  <span>
                    <BriefcaseBusiness size={15} />
                    {vehicle.luggage ?? "—"} Bags
                  </span>
                </div>

                <div className="fleet-card-bottom">
                  <span className="fleet-price-note">
                    {vehicle.status === "Available"
                      ? "Available for booking"
                      : vehicle.status === "On Trip"
                        ? "Currently on a trip"
                        : vehicle.status === "Maintenance"
                          ? "Under maintenance"
                          : vehicle.status || "Availability unknown"}
                  </span>

                  {vehicle.status === "Available" ? (
                    <Link
                      to="/booking"
                      className="fleet-book-button"
                      aria-label={`Book ${
                        vehicle.name || vehicle.type || "vehicle"
                      }`}
                    >
                      Book ride
                      <ArrowUpRight size={17} />
                    </Link>
                  ) : (
                    <span className="fleet-unavailable">
                      Unavailable
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="fleet-footer-note">
          <span className="fleet-footer-line" />
          <p>YOUR JOURNEY. YOUR COMFORT. YOUR MANZILL.</p>
          <span className="fleet-footer-line" />
        </div>
      </section>
    </main>
  );
}

export default Fleet;
