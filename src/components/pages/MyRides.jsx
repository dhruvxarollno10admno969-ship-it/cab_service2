import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  CarFront,
  Users,
  Route,
  IndianRupee,
  RefreshCw,
  History,
  Hash,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import '../styles/MyRides.css';

function MyRides() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedRides, setExpandedRides] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRides([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("uid", "==", user.uid)
    );

    return onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const getTimestamp = (ride) => {
          const value =
            ride.createdAt ||
            ride.bookedAt ||
            ride.updatedAt ||
            ride.date;

          if (value?.toDate) return value.toDate().getTime();

          const timestamp = value ? new Date(value).getTime() : 0;
          return Number.isNaN(timestamp) ? 0 : timestamp;
        };

        list.sort((a, b) => getTimestamp(b) - getTimestamp(a));

        setRides(list);
        setLoading(false);
      },
      (err) => {
        console.error("Unable to load bookings:", err);
        setError("Unable to load your rides. Please try again.");
        setLoading(false);
      }
    );
  }, [user, authLoading]);

  const getValue = (...values) =>
    values.find(
      (value) => value !== undefined && value !== null && value !== ""
    );

  const normalizeStatus = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (["accepted", "confirmed", "approved"].includes(value)) {
      return "Confirmed";
    }

    if (["complete", "completed", "finished"].includes(value)) {
      return "Completed";
    }

    if (["cancel", "cancelled", "canceled"].includes(value)) {
      return "Cancelled";
    }

    if (["pending", "requested"].includes(value)) {
      return "Pending";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getPickup = (ride) =>
    getValue(
      ride.pickup,
      ride.pickupLocation,
      ride.from,
      ride.startLocation,
      "Pickup unavailable"
    );

  const getDestination = (ride) =>
    getValue(
      ride.destination,
      ride.drop,
      ride.dropLocation,
      ride.to,
      ride.endLocation,
      "Destination unavailable"
    );

  const getVehicle = (ride) =>
    getValue(
      ride.vehicleName,
      ride.vehicle,
      ride.vehicleType,
      ride.carType,
      "Ride"
    );

  const getFare = (ride) =>
    getValue(
      ride.totalFare,
      ride.fare,
      ride.estimatedFare,
      ride.price,
      ride.amount,
      0
    );

  const formatFare = (value) => {
    const amount =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[₹,\s]/g, ""));

    return Number.isFinite(amount)
      ? `₹${amount.toLocaleString("en-IN")}`
      : `₹${value}`;
  };

  const getDate = (ride) => {
    const value = getValue(
      ride.date,
      ride.bookingDate,
      ride.createdAt
    );

    if (!value) return "Date unavailable";

    const date = value?.toDate ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filters = [
    "All",
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  const filteredRides =
    activeFilter === "All"
      ? rides
      : rides.filter(
          (ride) => normalizeStatus(ride.status) === activeFilter
        );

  const toggleRide = (id) => {
    setExpandedRides((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="my-rides-page">
        <div className="my-rides-container my-rides-message">
          <RefreshCw className="my-rides-spinner" size={26} />
          <p>Loading your rides...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-rides-page">
        <div className="my-rides-container my-rides-message">
          <History size={36} />
          <h2>Sign in to view your rides</h2>
          <p>
            Your booking history will appear here after you sign in.
          </p>

          <div className="my-rides-header-actions">
            <Link to="/" className="my-rides-home-button">
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <Link to="/login" className="my-rides-book-button">
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-rides-page">
      <div className="my-rides-container">
        {/* TOP-LEFT NAVIGATION */}
        <div className="my-rides-top-navigation">
          <Link to="/" className="my-rides-home-button">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* PAGE HEADER */}
        <header className="my-rides-heading">
          <div>
            <span className="my-rides-eyebrow">YOUR JOURNEYS</span>

            <h1>
              My Rides<span>.</span>
            </h1>

            <p>Your booking history, all in one place.</p>
          </div>

          <div className="my-rides-header-actions">
            <Link to="/booking" className="my-rides-book-button">
              Book a Ride <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* RIDE SUMMARY */}
        <div className="my-rides-summary">
          <div className="my-rides-summary-icon">
            <History size={22} />
          </div>

          <div className="my-rides-summary-stat">
            <strong>{rides.length}</strong>
            <span>Total rides</span>
          </div>

          <div className="my-rides-summary-divider" />

          <div className="my-rides-summary-stat">
            <strong>
              {
                rides.filter(
                  (ride) =>
                    normalizeStatus(ride.status) === "Completed"
                ).length
              }
            </strong>
            <span>Completed</span>
          </div>
        </div>

        {/* STATUS FILTERS */}
        <div className="my-rides-filters">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              <span>
                {filter === "All"
                  ? rides.length
                  : rides.filter(
                      (ride) =>
                        normalizeStatus(ride.status) === filter
                    ).length}
              </span>
            </button>
          ))}
        </div>

        {/* ERROR AND EMPTY STATES */}
        {error ? (
          <div className="my-rides-message">
            <p>{error}</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="my-rides-message">
            <History size={36} />

            <h2>
              {activeFilter === "All"
                ? "No rides yet"
                : `No ${activeFilter.toLowerCase()} rides`}
            </h2>

            <p>
              {activeFilter === "All"
                ? "Your bookings will appear here when you book your first ride."
                : "Try selecting another filter."}
            </p>

            {activeFilter === "All" && (
              <Link to="/booking" className="my-rides-book-button">
                Book Your First Ride <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          /* RIDE CARDS */
          <div className="my-rides-list">
            {filteredRides.map((ride) => {
              const expanded = Boolean(expandedRides[ride.id]);
              const status = normalizeStatus(ride.status);
              const vehicle = getVehicle(ride);
              const fare = getFare(ride);

              const reference = getValue(
                ride.bookingId,
                ride.bookingReference,
                ride.reference,
                ride.id
              );

              const details = [
                {
                  icon: <Clock3 size={16} />,
                  label: "Pickup time",
                  value: getValue(
                    ride.time,
                    ride.pickupTime,
                    ride.bookingTime,
                    ride.startTime
                  ),
                },
                {
                  icon: <Users size={16} />,
                  label: "Passengers",
                  value: getValue(
                    ride.passengers,
                    ride.passengerCount,
                    ride.numberOfPassengers
                  ),
                },
                {
                  icon: <Route size={16} />,
                  label: "Distance",
                  value: getValue(
                    ride.distance,
                    ride.distanceKm,
                    ride.totalDistance
                  ),
                  suffix: " km",
                },
                {
                  icon: <Clock3 size={16} />,
                  label: "Duration",
                  value: getValue(
                    ride.duration,
                    ride.estimatedDuration,
                    ride.travelTime
                  ),
                },
                {
                  icon: <CarFront size={16} />,
                  label: "Vehicle",
                  value: vehicle,
                },
                {
                  icon: <IndianRupee size={16} />,
                  label: "Price per km",
                  value: getValue(
                    ride.pricePerKm,
                    ride.ratePerKm
                  ),
                  money: true,
                },
                {
                  icon: <IndianRupee size={16} />,
                  label: "Base fare",
                  value: ride.baseFare,
                  money: true,
                },
                {
                  icon: <IndianRupee size={16} />,
                  label: "Toll charges",
                  value: getValue(
                    ride.toll,
                    ride.tollCharges
                  ),
                  money: true,
                },
              ];

              return (
                <article
                  className={`my-ride-card ${
                    expanded ? "is-expanded" : ""
                  }`}
                  key={ride.id}
                >
                  {/* VEHICLE AND STATUS */}
                  <div className="my-ride-card-top">
                    <div className="my-ride-vehicle">
                      <div className="my-ride-car-icon">
                        <CarFront size={21} />
                      </div>

                      <div>
                        <h2>{vehicle}</h2>

                        <p className="my-ride-reference">
                          <Hash size={12} />
                          {String(reference).slice(0, 12)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`my-ride-status status-${status.toLowerCase()}`}
                    >
                      <span />
                      {status}
                    </span>
                  </div>

                  {/* PICKUP AND DESTINATION */}
                  <div className="my-ride-route">
                    <div className="my-ride-route-marker">
                      <span className="pickup-dot" />
                      <span className="route-line" />
                      <MapPin className="destination-pin" size={16} />
                    </div>

                    <div className="my-ride-route-addresses">
                      <div>
                        <small>PICKUP</small>
                        <p>{getPickup(ride)}</p>
                      </div>

                      <div>
                        <small>DESTINATION</small>
                        <p>{getDestination(ride)}</p>
                      </div>
                    </div>
                  </div>

                  {/* DATE AND FARE */}
                  <div className="my-ride-preview">
                    <div>
                      <CalendarDays size={16} />

                      <span>
                        <small>RIDE DATE</small>
                        <strong>{getDate(ride)}</strong>
                      </span>
                    </div>

                    <div className="my-ride-total">
                      <span>
                        <small>TOTAL FARE</small>
                        <strong>{formatFare(fare)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* EXPAND/COLLAPSE */}
                  <button
                    type="button"
                    className="my-ride-toggle"
                    onClick={() => toggleRide(ride.id)}
                    aria-expanded={expanded}
                    aria-controls={`ride-details-${ride.id}`}
                  >
                    <span>
                      {expanded ? "Hide details" : "View full details"}
                    </span>

                    <ChevronDown
                      size={17}
                      className={expanded ? "rotated" : ""}
                    />
                  </button>

                  {/* FULL DETAILS */}
                  {expanded && (
                    <div
                      className="my-ride-expanded-details"
                      id={`ride-details-${ride.id}`}
                    >
                      <h3>Booking details</h3>

                      <div className="my-ride-details">
                        {details.map((detail) => (
                          <div key={detail.label}>
                            {detail.icon}

                            <span>
                              <small>{detail.label}</small>

                              <strong>
                                {detail.value == null ||
                                detail.value === ""
                                  ? "Not provided"
                                  : detail.money
                                    ? formatFare(detail.value)
                                    : `${detail.value}${
                                        detail.suffix || ""
                                      }`}
                              </strong>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="my-ride-expanded-reference">
                        <span>Booking reference</span>
                        <p>{reference}</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRides; 