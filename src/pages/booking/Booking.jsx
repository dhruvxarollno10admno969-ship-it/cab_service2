
import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Minus,
  Plus,
  CarFront,
} from "lucide-react";

import {
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

import { db } from "../../firebase";
import "./booking.css";

const auth = getAuth();

// =====================================================
// VEHICLE DATA HELPERS
// =====================================================

const getVehicleName = (data) =>
  data.name || data.vehicleName || data.model || data.title || "Car";

const getVehiclePrice = (data) =>
  Number(data.pricePerKm ?? data.price ?? data.ratePerKm ?? 12);

const getVehicleSeats = (data) =>
  Number(data.seats ?? data.capacity ?? data.maxPassengers ?? 4);

const getVehicleBaseFare = (data) =>
  Number(data.baseFare ?? data.basePrice ?? 50);

// =====================================================
// BOOKING
// =====================================================

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [pickup, setPickup] = useState(
    location.state?.pickup || searchParams.get("pickup") || ""
  );

  const [destination, setDestination] = useState(
    location.state?.destination || searchParams.get("destination") || ""
  );

  const [vehicles, setVehicles] = useState([]);
  const [vehicle, setVehicle] = useState("");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRideBookedPopup, setShowRideBookedPopup] = useState(false);
  const [acceptedBookingId, setAcceptedBookingId] = useState(null);

  // ===================================================
  // REAL-TIME FIREBASE VEHICLES
  // ===================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "vehicles"),
      (snapshot) => {
        const firebaseVehicles = snapshot.docs
          .map((vehicleDoc) => {
            const data = vehicleDoc.data();

            const name = getVehicleName(data);
            const price = getVehiclePrice(data);
            const maxPassengers = getVehicleSeats(data);
            const baseFare = getVehicleBaseFare(data);

            return {
              id: vehicleDoc.id,
              name,
              description:
                data.description ||
                data.details ||
                "Comfortable ride for your journey",
              price,
              baseFare,
              maxPassengers,
              seats: `${maxPassengers} seats`,
              image: data.image || data.imageUrl || data.photoURL || "",
              available:
                data.available !== false &&
                data.isAvailable !== false,
            };
          })
          .filter(
            (item) =>
              item.available &&
              Number.isFinite(item.price) &&
              item.price >= 0 &&
              Number.isFinite(item.baseFare) &&
              item.baseFare >= 0 &&
              Number.isFinite(item.maxPassengers) &&
              item.maxPassengers >= 1
          );

        setVehicles(firebaseVehicles);
        setVehiclesError("");

        setVehicle((currentVehicle) => {
          const stillExists = firebaseVehicles.some(
            (item) => item.name === currentVehicle
          );

          return stillExists
            ? currentVehicle
            : firebaseVehicles[0]?.name || "";
        });

        setPassengers((currentPassengers) => {
          const selected = firebaseVehicles.find(
            (item) =>
              item.name ===
              (firebaseVehicles.some(
                (v) => v.name === vehicle
              )
                ? vehicle
                : firebaseVehicles[0]?.name)
          );

          return selected
            ? Math.min(
                Math.max(1, currentPassengers),
                selected.maxPassengers
              )
            : 1;
        });

        setVehiclesLoading(false);
      },
      (firebaseError) => {
        console.error("Vehicles listener error:", firebaseError);
        setVehiclesError(
          "Could not load cars. Check your Firebase permissions and try again."
        );
        setVehiclesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ===================================================
  // LISTEN FOR ADMIN ACCEPTANCE
  // ===================================================

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      async (snapshot) => {
        for (const bookingDocument of snapshot.docs) {
          const booking = bookingDocument.data();
          const bookingId = bookingDocument.id;

          if (
            booking.status === "Accepted" &&
            booking.notificationShown !== true &&
            acceptedBookingId !== bookingId
          ) {
            setAcceptedBookingId(bookingId);
            setShowRideBookedPopup(true);

            try {
              await updateDoc(doc(db, "bookings", bookingId), {
                notificationShown: true,
              });
            } catch (notificationError) {
              console.error(
                "Could not mark notification as shown:",
                notificationError
              );
            }
          }
        }
      },
      (listenerError) => {
        console.error("Booking listener error:", listenerError);
      }
    );

    return () => unsubscribe();
  }, [acceptedBookingId]);

  // ===================================================
  // SELECTED VEHICLE
  // ===================================================

  const selectedVehicle =
    vehicles.find((item) => item.name === vehicle) || null;

  // ===================================================
  // FARE
  // ===================================================

  const fare =
    distance !== null && selectedVehicle
      ? Math.ceil(
          selectedVehicle.baseFare +
            distance * selectedVehicle.price
        )
      : null;

  // ===================================================
  // GEOCODING
  // ===================================================

  const getCoordinates = async (locationName) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
        locationName
      )}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Location search failed. Please try again.");
    }

    const data = await response.json();

    if (!data.length) {
      throw new Error(`Could not find "${locationName}".`);
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  };

  // ===================================================
  // CALCULATE ROUTE
  // ===================================================

  const calculateRoute = async () => {
    if (!pickup.trim() || !destination.trim()) {
      setError("Enter both pickup and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const pickupCoordinates = await getCoordinates(pickup);
      const destinationCoordinates = await getCoordinates(destination);

      const routeUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${pickupCoordinates.longitude},${pickupCoordinates.latitude};` +
        `${destinationCoordinates.longitude},${destinationCoordinates.latitude}` +
        `?overview=false`;

      const response = await fetch(routeUrl);

      if (!response.ok) {
        throw new Error("Route calculation failed.");
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No driving route was found.");
      }

      const route = data.routes[0];

      setDistance(route.distance / 1000);
      setDuration(Math.ceil(route.duration / 60));
      setError("");
    } catch (err) {
      console.error("Route calculation error:", err);
      setDistance(null);
      setDuration(null);
      setError(
        err.message ||
          "Something went wrong while calculating the route."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // CHANGE VEHICLE
  // ===================================================

  const handleVehicleChange = (name) => {
    const selected = vehicles.find((item) => item.name === name);

    if (!selected) return;

    setVehicle(name);
    setPassengers((current) =>
      Math.min(current, selected.maxPassengers)
    );
    setError("");
    setSuccess("");
  };

  // ===================================================
  // PASSENGERS
  // ===================================================

  const decreasePassengers = () => {
    setPassengers((current) => Math.max(1, current - 1));
  };

  const increasePassengers = () => {
    if (!selectedVehicle) return;

    setPassengers((current) =>
      Math.min(selectedVehicle.maxPassengers, current + 1)
    );
  };

  // ===================================================
  // SUBMIT BOOKING
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter pickup and destination.");
      return;
    }

    if (distance === null || !Number.isFinite(distance)) {
      setError("Please calculate the route before continuing.");
      return;
    }

    if (!selectedVehicle) {
      setError("Please select an available vehicle.");
      return;
    }

    if (!date || !time) {
      setError("Please select your date and time.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please log in before creating a booking.");
      return;
    }

    if (
      passengers < 1 ||
      passengers > selectedVehicle.maxPassengers
    ) {
      setError("Passenger count exceeds the selected car's capacity.");
      return;
    }

    setLoading(true);

    try {
      let customerName = user.displayName || "Customer";
      let customerPhone = "";

      try {
        const customerRef = doc(db, "customers", user.uid);
        const customerSnapshot = await getDoc(customerRef);

        if (customerSnapshot.exists()) {
          const customerData = customerSnapshot.data();

          customerName =
            customerData.name ||
            customerData.customerName ||
            user.displayName ||
            "Customer";

          customerPhone = customerData.phone || "";
        }
      } catch (profileError) {
        console.warn(
          "Could not load customer profile:",
          profileError
        );
      }

      const bookingData = {
        uid: user.uid,
        customer: customerName,
        email: user.email || "",
        phone: customerPhone,

        pickup: pickup.trim(),
        destination: destination.trim(),

        vehicle: selectedVehicle.name,
        vehicleId: selectedVehicle.id,
        passengers: Number(passengers),

        date,
        time,

        distance: Number(distance.toFixed(1)),
        duration: Number(duration),

        fare: Number(fare),
        baseFare: Number(selectedVehicle.baseFare),
        toll: 0,
        pricePerKm: Number(selectedVehicle.price),

        status: "Pending",
        notificationShown: false,

        bookedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      console.log("Creating Firebase booking:", bookingData);

      const bookingRef = await addDoc(
        collection(db, "bookings"),
        bookingData
      );

      console.log("Booking created successfully:", bookingRef.id);

      setSuccess("Booking request submitted successfully!");

      alert("Booking request submitted successfully!");
      navigate("/");
    } catch (firebaseError) {
      console.error("Booking creation error:", firebaseError);

      if (firebaseError?.code === "permission-denied") {
        setError(
          "Firebase permission denied. Check your Firestore security rules."
        );
      } else {
        setError(
          firebaseError?.message ||
            "Unable to create booking. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <main className="booking-page">
      {showRideBookedPopup && (
        <div className="ride-popup-overlay">
          <div className="ride-popup">
            <div className="ride-popup-icon">✓</div>
            <h2>Ride Booked!</h2>
            <p>Your ride has been accepted by the admin.</p>

            <button
              type="button"
              onClick={() => setShowRideBookedPopup(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <header className="booking-header">
        <Link to="/" className="booking-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </header>

      <section className="booking-container">
        <div className="booking-title">
          <p className="eyebrow">
            <span></span>
            BOOK A RIDE
          </p>

          <h1>
            Where are you
            <br />
            going?
          </h1>

          <p>
            Enter your journey details and we'll calculate the route
            and estimated fare.
          </p>
        </div>

        <form className="booking-layout" onSubmit={handleSubmit}>
          <div className="booking-form">
            <div className="booking-block">
              <div className="booking-block-header">
                <span>01</span>
                <h2>Journey</h2>
              </div>

              <div className="location-fields">
                <label className="booking-location">
                  <span className="booking-dot pickup-dot"></span>

                  <div>
                    <small>FROM</small>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(event) => {
                        setPickup(event.target.value);
                        setDistance(null);
                        setDuration(null);
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="e.g. Phagwara"
                      required
                    />
                  </div>
                </label>

                <div className="booking-location-line"></div>

                <label className="booking-location">
                  <span className="booking-dot destination-dot"></span>

                  <div>
                    <small>TO</small>
                    <input
                      type="text"
                      value={destination}
                      onChange={(event) => {
                        setDestination(event.target.value);
                        setDistance(null);
                        setDuration(null);
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="e.g. Jalandhar"
                      required
                    />
                  </div>
                </label>

                <button
                  type="button"
                  className="calculate-route"
                  onClick={calculateRoute}
                  disabled={loading}
                >
                  {loading ? "Calculating route..." : "Calculate Route"}
                  {!loading && <ArrowUpRight size={17} />}
                </button>

                {error && (
                  <p className="booking-error">{error}</p>
                )}

                {success && (
                  <p className="booking-success">{success}</p>
                )}
              </div>
            </div>

            {distance !== null && (
              <div className="route-result">
                <div>
                  <span>DISTANCE</span>
                  <strong>{distance.toFixed(1)} km</strong>
                </div>

                <div>
                  <span>EST. TIME</span>
                  <strong>{duration} min</strong>
                </div>
              </div>
            )}

            <div className="booking-block">
              <div className="booking-block-header">
                <span>02</span>
                <h2>Choose your ride</h2>
              </div>

              {vehiclesLoading ? (
                <p className="vehicle-message">Loading available cars...</p>
              ) : vehiclesError ? (
                <p className="booking-error">{vehiclesError}</p>
              ) : vehicles.length === 0 ? (
                <div className="vehicle-empty">
                  <CarFront size={28} />
                  <p>No cars are available right now.</p>
                  <small>Please check back later.</small>
                </div>
              ) : (
                <div className="vehicle-options">
                  {vehicles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`vehicle-option ${
                        vehicle === item.name ? "selected" : ""
                      }`}
                      onClick={() => handleVehicleChange(item.name)}
                    >
                      <div className="vehicle-info">
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                        <small>{item.seats}</small>
                      </div>

                      <div className="vehicle-price">
                        ₹{item.price}/km
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-block">
              <div className="booking-block-header">
                <span>03</span>
                <h2>Date & Time</h2>
              </div>

              <div className="booking-date-row">
                <label>
                  <small>DATE</small>
                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                  />
                </label>

                <label>
                  <small>TIME</small>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => {
                      setTime(event.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="booking-block">
              <div className="booking-block-header">
                <span>04</span>
                <h2>Passengers</h2>
              </div>

              <div className="passenger-control">
                <button
                  type="button"
                  onClick={decreasePassengers}
                  disabled={passengers === 1 || !selectedVehicle}
                >
                  <Minus size={18} />
                </button>

                <div>
                  <strong>{passengers}</strong>
                  <span>
                    {passengers === 1 ? "Passenger" : "Passengers"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={increasePassengers}
                  disabled={
                    !selectedVehicle ||
                    passengers >= selectedVehicle.maxPassengers
                  }
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          <aside className="booking-summary">
            <div className="summary-top">
              <span>YOUR JOURNEY</span>
              <MapPin size={20} />
            </div>

            <div className="summary-route">
              <div className="summary-location">
                <span className="summary-dot pickup-dot"></span>
                <div>
                  <small>PICKUP</small>
                  <strong>{pickup || "Your pickup location"}</strong>
                </div>
              </div>

              <div className="summary-line"></div>

              <div className="summary-location">
                <span className="summary-dot destination-dot"></span>
                <div>
                  <small>DESTINATION</small>
                  <strong>{destination || "Your destination"}</strong>
                </div>
              </div>
            </div>

            <div className="summary-details">
              <div>
                <span>Vehicle</span>
                <strong>{selectedVehicle?.name || "--"}</strong>
              </div>

              <div>
                <span>Passengers</span>
                <strong>{passengers}</strong>
              </div>

              <div>
                <span>Distance</span>
                <strong>
                  {distance !== null ? `${distance.toFixed(1)} km` : "--"}
                </strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{duration !== null ? `${duration} min` : "--"}</strong>
              </div>
            </div>

            <div className="summary-fare">
              <span>Estimated fare</span>

              <strong>
                {fare !== null ? `₹${fare}` : "--"}
              </strong>

              <small>
                {selectedVehicle
                  ? `Base fare ₹${selectedVehicle.baseFare} + ₹${selectedVehicle.price}/km`
                  : "Select an available car to view pricing"}
              </small>
            </div>

            <button
              type="submit"
              className="confirm-booking"
              disabled={
                loading ||
                vehiclesLoading ||
                !selectedVehicle ||
                vehicles.length === 0
              }
            >
              {loading ? "Submitting..." : "Continue Booking"}
              {!loading && <ArrowUpRight size={19} />}
            </button>

            <p className="booking-note">
              Final fare may vary based on the actual route and booking
              conditions.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}

export default Booking;
