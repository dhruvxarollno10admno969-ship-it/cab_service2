
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
import "./fleet.css";

function getVehicleDefaults(type) {
  switch (type) {
    case "SUV":
      return {
        price: 16,
        passengers: 6,
        luggage: 4,
        category: "FAMILY & GROUPS",
      };

    case "Premium":
      return {
        price: 22,
        passengers: 4,
        luggage: 3,
        category: "PREMIUM TRAVEL",
      };

    case "Hatchback":
      return {
        price: 10,
        passengers: 4,
        luggage: 2,
        category: "CITY TRAVEL",
      };

    case "MUV":
      return {
        price: 18,
        passengers: 7,
        luggage: 4,
        category: "GROUP TRAVEL",
      };

    default:
      return {
        price: 12,
        passengers: 4,
        luggage: 2,
        category: "EVERYDAY TRAVEL",
      };
  }
}

function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


useEffect(() => {
  console.log("MANZILL Fleet component mounted");
  console.log("Firestore db instance:", db);

  const vehiclesRef = collection(db, "vehicles");
  console.log("Vehicles collection reference:", vehiclesRef);

  const unsubscribe = onSnapshot(
    vehiclesRef,
    (snapshot) => {
      console.log("Firestore request successful");
      console.log("Vehicles found:", snapshot.size);
      console.log(
        "Vehicle documents:",
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );

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
      console.error("Fleet Firestore error:", firebaseError.code);
      console.error("Error details:", firebaseError.message);

      setError(firebaseError.message);
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, []);

  return (
    <main className="fleet-page">
      <section className="fleet-section">
        <div className="fleet-top">
          <p className="fleet-label">
            <span className="fleet-label-dot" />
            MANZILL 777 / OUR FLEET
          </p>
        </div>

        <div className="fleet-heading">
          <h1>
            Find your
            <span> perfect ride.</span>
          </h1>

          <div className="fleet-heading-content">
            <p>
              From everyday city rides to premium long-distance
              journeys, travel your way with MANZILL 777.
              Comfort, space and reliability. Find the right ride for
            wherever your journey takes you.
            </p>
          </div>
        </div>

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
                className={`fleet-card ${index === 0 ? "featured" : ""}`}
                key={vehicle.id}
              >
                <div className="fleet-image">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="fleet-image-placeholder">
                      <CarFront size={64} />
                      <span>{vehicle.type}</span>
                    </div>
                  )}

                  <span className="fleet-tag">
                    {vehicle.category}
                  </span>

                  <span className="fleet-image-number">777</span>
                </div>

                <div className="fleet-info">
                  <div className="fleet-title-group">
                    <span className="fleet-type">
                      MANZILL COLLECTION
                    </span>
                    <h2>{vehicle.name}</h2>
                  </div>

                  <p className="fleet-price">
                    ₹{vehicle.price}
                    <span>/ km</span>
                  </p>
                </div>

                <p className="fleet-description">
                  {vehicle.description}
                </p>

                <div className="fleet-features">
                  <span>
                    <Users size={15} />
                    {vehicle.passengers} Passengers
                  </span>

                  <span>
                    <BriefcaseBusiness size={15} />
                    {vehicle.luggage} Bags
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
                          : vehicle.status}
                  </span>

                  {vehicle.status === "Available" ? (
                    <Link
                      to="/booking"
                      className="fleet-book-button"
                      aria-label={`Book ${vehicle.name}`}
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

