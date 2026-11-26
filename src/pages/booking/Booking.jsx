
import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import emailjs from "@emailjs/browser";
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

const getVehicleName = (data) =>
  data.name || data.vehicleName || data.model || data.title || "Car";

const getVehicleSeats = (data) =>
  Number(
    data.seats ??
      data.capacity ??
      data.maxPassengers ??
      data.passengers ??
      4
  );

const getVehicleBaseFare = (data) =>
  Number(data.baseFare ?? data.basePrice ?? 50);

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [pickup, setPickup] = useState(
    location.state?.pickup || searchParams.get("pickup") || ""
  );

  const [destination, setDestination] = useState(
    location.state?.destination ||
      searchParams.get("destination") ||
      ""
  );

  const [tripType, setTripType] = useState("One Way");
  const [returnTime, setReturnTime] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);

  // Keep each leg separate; Road Trip uses combined distance and duration.
  const [oneWayDistance, setOneWayDistance] = useState(null);
  const [oneWayDuration, setOneWayDuration] = useState(null);
  const [returnDistance, setReturnDistance] = useState(null);
  const [returnDuration, setReturnDuration] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRideBookedPopup, setShowRideBookedPopup] = useState(false);
  const [acceptedBookingId, setAcceptedBookingId] = useState(null);

  const isRoadTrip = tripType === "Road Trip";

  const distance =
    oneWayDistance === null
      ? null
      : isRoadTrip
        ? returnDistance === null
          ? null
          : oneWayDistance + returnDistance
        : oneWayDistance;

  const duration =
    oneWayDuration === null
      ? null
      : isRoadTrip
        ? returnDuration === null
          ? null
          : oneWayDuration + returnDuration
        : oneWayDuration;

  // =====================================================
  // LOAD LIVE VEHICLES FROM FIRESTORE
  // =====================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "vehicles"),
      (snapshot) => {
        const firebaseVehicles = snapshot.docs
          .map((vehicleDoc) => {
            const data = vehicleDoc.data();

            const legacyPrice = Number(
              data.pricePerKm ??
                data.price ??
                data.ratePerKm ??
                12
            );

            const oneWayPricePerKm = Number(
              data.oneWayPricePerKm ??
                data.pricePerKm ??
                data.price ??
                data.ratePerKm ??
                12
            );

            const roadTripPricePerKm = Number(
              data.roadTripPricePerKm ??
                data.pricePerKm ??
                data.price ??
                data.ratePerKm ??
                12
            );

            const maxPassengers = getVehicleSeats(data);
            const baseFare = getVehicleBaseFare(data);

            return {
              id: vehicleDoc.id,
              name: getVehicleName(data),

              description:
                data.description ||
                data.details ||
                "Comfortable ride for your journey",

              oneWayPricePerKm: Number.isFinite(oneWayPricePerKm)
                ? oneWayPricePerKm
                : legacyPrice,

              roadTripPricePerKm: Number.isFinite(roadTripPricePerKm)
                ? roadTripPricePerKm
                : legacyPrice,

              baseFare,
              maxPassengers,
              seats: `${maxPassengers} seats`,

              image:
                data.image ||
                data.imageUrl ||
                data.photoURL ||
                "",

              available:
                data.available !== false &&
                data.isAvailable !== false &&
                (!data.status || data.status === "Available"),
            };
          })
          .filter(
            (item) =>
              item.available &&
              Number.isFinite(item.oneWayPricePerKm) &&
              item.oneWayPricePerKm >= 0 &&
              Number.isFinite(item.roadTripPricePerKm) &&
              item.roadTripPricePerKm >= 0 &&
              Number.isFinite(item.baseFare) &&
              item.baseFare >= 0 &&
              Number.isFinite(item.maxPassengers) &&
              item.maxPassengers >= 1
          );

        setVehicles(firebaseVehicles);
        setVehiclesError("");

        setVehicleId((currentId) => {
          const stillExists = firebaseVehicles.some(
            (item) => item.id === currentId
          );

          return stillExists
            ? currentId
            : firebaseVehicles[0]?.id || "";
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

  const selectedVehicle =
    vehicles.find((item) => item.id === vehicleId) || null;

  const selectedPricePerKm = selectedVehicle
    ? isRoadTrip
      ? selectedVehicle.roadTripPricePerKm
      : selectedVehicle.oneWayPricePerKm
    : null;

  // =====================================================
  // PASSENGER LIMIT
  // =====================================================

  useEffect(() => {
    if (!selectedVehicle) {
      setPassengers(1);
      return;
    }

    setPassengers((current) =>
      Math.min(
        Math.max(1, current),
        selectedVehicle.maxPassengers
      )
    );
  }, [vehicleId, selectedVehicle?.maxPassengers]);

  // =====================================================
  // CUSTOMER BOOKING CONFIRMATION LISTENER
  // Admin status: Confirmed
  // =====================================================

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return undefined;

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
            booking.status === "Confirmed" &&
            booking.notificationShown !== true &&
            acceptedBookingId !== bookingId
          ) {
            setAcceptedBookingId(bookingId);
            setShowRideBookedPopup(true);

            try {
              await updateDoc(
                doc(db, "bookings", bookingId),
                {
                  notificationShown: true,
                }
              );
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
        console.error(
          "Booking listener error:",
          listenerError
        );
      }
    );

    return () => unsubscribe();
  }, [acceptedBookingId]);

  // =====================================================
  // FARE CALCULATION
  // =====================================================

  const fare =
    distance !== null &&
    selectedVehicle &&
    selectedPricePerKm !== null
      ? Math.ceil(
          selectedVehicle.baseFare +
            distance * selectedPricePerKm
        )
      : null;

  // =====================================================
  // CLEAR ROUTE
  // =====================================================

  const clearRoute = () => {
    setOneWayDistance(null);
    setOneWayDuration(null);
    setReturnDistance(null);
    setReturnDuration(null);
  };

  // =====================================================
  // LOCATION COORDINATES
  // =====================================================

  const getCoordinates = async (locationName) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
        locationName
      )}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Location search failed. Please try again."
      );
    }

    const data = await response.json();

    if (!data.length) {
      throw new Error(
        `Could not find "${locationName}".`
      );
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  };

  // =====================================================
  // DRIVING ROUTE
  // =====================================================

  const getDrivingRoute = async (start, end) => {
    const routeUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
      `?overview=false`;

    const response = await fetch(routeUrl);

    if (!response.ok) {
      throw new Error(
        "Route calculation failed. Please try again."
      );
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error("No driving route was found.");
    }

    return {
      distance: data.routes[0].distance / 1000,
      duration: Math.ceil(
        data.routes[0].duration / 60
      ),
    };
  };

  // =====================================================
  // CALCULATE COMPLETE ROUTE
  // =====================================================

  const calculateRoute = async () => {
    if (!pickup.trim() || !destination.trim()) {
      setError("Enter both pickup and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    clearRoute();

    try {
      const pickupCoordinates = await getCoordinates(
        pickup.trim()
      );

      const destinationCoordinates = await getCoordinates(
        destination.trim()
      );

      const outboundRoute = await getDrivingRoute(
        pickupCoordinates,
        destinationCoordinates
      );

      setOneWayDistance(outboundRoute.distance);
      setOneWayDuration(outboundRoute.duration);

      if (isRoadTrip) {
        const returnRoute = await getDrivingRoute(
          destinationCoordinates,
          pickupCoordinates
        );

        setReturnDistance(returnRoute.distance);
        setReturnDuration(returnRoute.duration);
      }
    } catch (routeError) {
      console.error(
        "Route calculation error:",
        routeError
      );

      clearRoute();

      setError(
        routeError.message ||
          "Something went wrong while calculating the route."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TRIP TYPE CHANGE
  // =====================================================

  const handleTripTypeChange = (nextTripType) => {
    if (nextTripType === tripType) return;

    setTripType(nextTripType);
    setReturnTime("");
    clearRoute();
    setError("");
    setSuccess("");
  };

  // =====================================================
  // VEHICLE CHANGE
  // =====================================================

  const handleVehicleChange = (id) => {
    const selected = vehicles.find(
      (item) => item.id === id
    );

    if (!selected) return;

    setVehicleId(id);

    setPassengers((current) =>
      Math.min(
        Math.max(1, current),
        selected.maxPassengers
      )
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // PASSENGER CONTROLS
  // =====================================================

  const decreasePassengers = () => {
    setPassengers((current) =>
      Math.max(1, current - 1)
    );
  };

  const increasePassengers = () => {
    if (!selectedVehicle) return;

    setPassengers((current) =>
      Math.min(
        selectedVehicle.maxPassengers,
        current + 1
      )
    );
  };

  // =====================================================
  // SUBMIT BOOKING
  // =====================================================


const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSuccess("");

  // ========================================
  // 1. VALIDATE BOOKING DETAILS
  // ========================================

  if (!pickup.trim() || !destination.trim()) {
    setError("Please enter pickup and destination.");
    return;
  }

  if (distance === null || !Number.isFinite(distance)) {
    setError("Please calculate the complete route before continuing.");
    return;
  }

  if (
    isRoadTrip &&
    (returnDistance === null || returnDuration === null)
  ) {
    setError("Please calculate both legs of the Road Trip.");
    return;
  }

  if (!selectedVehicle) {
    setError("Please select an available vehicle.");
    return;
  }

  if (!date || !time) {
    setError("Please select your pickup date and time.");
    return;
  }

  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (date < localToday) {
    setError("Pickup date cannot be in the past.");
    return;
  }

  if (isRoadTrip) {
    if (!returnTime) {
      setError("Please select your return time for the Road Trip.");
      return;
    }

    if (returnTime <= time) {
      setError(
        "Return time must be later than pickup time on the same day."
      );
      return;
    }
  }

  // ========================================
  // 2. CHECK AUTHENTICATION
  // ========================================

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
    // ========================================
    // 3. LOAD CUSTOMER PROFILE
    // ========================================

    const customerRef = doc(db, "customers", user.uid);

    const customerSnapshot = await getDoc(customerRef);

    if (!customerSnapshot.exists()) {
      navigate("/complete-profile", {
        state: {
          from: "/booking",
        },
      });

      return;
    }

    const customerData = customerSnapshot.data();

    // ========================================
    // 4. VALIDATE CUSTOMER PROFILE
    // ========================================

    const requiredFields = [
      "name",
      "phone",
      "address",
      "city",
      "state",
      "country",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !customerData[field] ||
        String(customerData[field]).trim() === ""
    );

    if (missingFields.length > 0) {
      navigate("/complete-profile", {
        state: {
          from: "/booking",
        },
      });

      return;
    }

    const customerName = String(customerData.name).trim();
    const customerPhone = String(customerData.phone).trim();

    // ========================================
    // 5. PREPARE BOOKING DATA
    // ========================================

    const bookingData = {
      uid: user.uid,

      customer: customerName,
      email: user.email || "",
      phone: customerPhone,

      tripType,

      pickup: pickup.trim(),
      destination: destination.trim(),

      returnPickup: isRoadTrip ? pickup.trim() : "",

      date,
      time,

      returnTime: isRoadTrip ? returnTime : "",

      vehicle: selectedVehicle.name,
      vehicleId: selectedVehicle.id,

      passengers: Number(passengers),

      oneWayDistance: Number(oneWayDistance.toFixed(1)),

      returnDistance: isRoadTrip
        ? Number(returnDistance.toFixed(1))
        : 0,

      distance: Number(distance.toFixed(1)),

      oneWayDuration: Number(oneWayDuration),

      returnDuration: isRoadTrip
        ? Number(returnDuration)
        : 0,

      duration: Number(duration),

      fare: Number(fare),

      baseFare: Number(selectedVehicle.baseFare),

      toll: 0,

      pricePerKm: Number(selectedPricePerKm),

      oneWayPricePerKm: Number(
        selectedVehicle.oneWayPricePerKm
      ),

      roadTripPricePerKm: Number(
        selectedVehicle.roadTripPricePerKm
      ),

      status: "Pending",
      notificationShown: false,

      bookedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    // ========================================
    // 6. SAVE BOOKING TO FIRESTORE
    // ========================================

    const bookingRef = await addDoc(
      collection(db, "bookings"),
      bookingData
    );

    console.log("Booking created:", bookingRef.id);

    // ========================================
    // 7. SEND BOOKING EMAIL TO ADMIN
    // ========================================

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          booking_id: bookingRef.id,

          trip_type: bookingData.tripType,
          status: bookingData.status,

          customer_name: bookingData.customer,
          customer_email: bookingData.email,
          customer_phone: bookingData.phone,

          pickup: bookingData.pickup,
          destination: bookingData.destination,

          date: bookingData.date,
          time: bookingData.time,

          return_time: bookingData.returnTime || "N/A",

          vehicle: bookingData.vehicle,
          passengers: bookingData.passengers,

          distance: bookingData.distance,
          duration: bookingData.duration,

          fare: bookingData.fare,
        },
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        }
      );

      console.log("Admin email sent successfully!");

    } catch (emailError) {
      console.error("EmailJS notification failed:", emailError);

      // Booking remains saved in Firebase.
    }

    // ========================================
    // 8. SUCCESS
    // ========================================

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


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="booking-page">
      {showRideBookedPopup && (
        <div className="ride-popup-overlay">
          <div
            className="ride-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ride-popup-title"
          >
            <div className="ride-popup-icon">
              ✓
            </div>

            <h2 id="ride-popup-title">
              Ride Booked!
            </h2>

            <p>
              Your ride has been accepted by the admin.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowRideBookedPopup(false)
              }
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
            Enter your journey details and we'll
            calculate the route and estimated fare.
          </p>
        </div>

        <form
          className="booking-layout"
          onSubmit={handleSubmit}
        >
          <div className="booking-form">
            {/* JOURNEY */}

            <div className="booking-block">
              <div className="booking-block-header">
                <span>01</span>
                <h2>Journey</h2>
              </div>

              <div className="location-fields">
                <div className="booking-trip-type">
                  <button
                    type="button"
                    className={`trip-type-option ${
                      tripType === "One Way"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTripTypeChange("One Way")
                    }
                    aria-pressed={
                      tripType === "One Way"
                    }
                  >
                    One Way
                  </button>

                  <button
                    type="button"
                    className={`trip-type-option ${
                      tripType === "Road Trip"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTripTypeChange("Road Trip")
                    }
                    aria-pressed={
                      tripType === "Road Trip"
                    }
                  >
                    Road Trip
                  </button>
                </div>

                <label className="booking-location">
                  <span className="booking-dot pickup-dot"></span>

                  <div>
                    <small>FROM</small>

                    <input
                      type="text"
                      value={pickup}
                      onChange={(event) => {
                        setPickup(event.target.value);
                        clearRoute();
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="e.g. Phagwara"
                      autoComplete="off"
                      required
                    />
                  </div>
                </label>

                <div
                  className="booking-location-line"
                  aria-hidden="true"
                ></div>

                <label className="booking-location">
                  <span className="booking-dot destination-dot"></span>

                  <div>
                    <small>TO</small>

                    <input
                      type="text"
                      value={destination}
                      onChange={(event) => {
                        setDestination(event.target.value);
                        clearRoute();
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="e.g. Jalandhar"
                      autoComplete="off"
                      required
                    />
                  </div>
                </label>

                {isRoadTrip && (
                  <div className="booking-return-info">
                    <MapPin size={16} />

                    <span>
                      Return journey:{" "}
                      {destination || "Destination"} →{" "}
                      {pickup || "Pickup"}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="calculate-route"
                  onClick={calculateRoute}
                  disabled={loading}
                >
                  {loading
                    ? "Calculating route..."
                    : "Calculate Route"}

                  {!loading && (
                    <ArrowUpRight size={17} />
                  )}
                </button>

                {error && (
                  <p className="booking-error">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="booking-success">
                    {success}
                  </p>
                )}
              </div>
            </div>

            {/* ROUTE RESULTS */}

            {distance !== null && (
              <div className="route-result">
                <div>
                  <span>TOTAL DISTANCE</span>
                  <strong>
                    {distance.toFixed(1)} km
                  </strong>
                </div>

                <div>
                  <span>EST. TOTAL TIME</span>
                  <strong>
                    {duration} min
                  </strong>
                </div>
              </div>
            )}

            {isRoadTrip && distance !== null && (
              <div className="route-result booking-route-legs">
                <div>
                  <span>OUTBOUND</span>
                  <strong>
                    {oneWayDistance.toFixed(1)} km
                  </strong>
                </div>

                <div>
                  <span>RETURN</span>
                  <strong>
                    {returnDistance.toFixed(1)} km
                  </strong>
                </div>
              </div>
            )}

            {/* VEHICLES */}

            <div className="booking-block">
              <div className="booking-block-header">
                <span>02</span>
                <h2>Choose your ride</h2>
              </div>

              {vehiclesLoading ? (
                <p className="vehicle-message">
                  Loading available cars...
                </p>
              ) : vehiclesError ? (
                <p className="booking-error">
                  {vehiclesError}
                </p>
              ) : vehicles.length === 0 ? (
                <div className="vehicle-empty">
                  <CarFront size={28} />

                  <p>
                    No cars are available right now.
                  </p>

                  <small>
                    Please check back later.
                  </small>
                </div>
              ) : (
                <div className="vehicle-options">
                  {vehicles.map((item) => {
                    const itemPrice = isRoadTrip
                      ? item.roadTripPricePerKm
                      : item.oneWayPricePerKm;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`vehicle-option ${
                          vehicleId === item.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleVehicleChange(item.id)
                        }
                        aria-pressed={
                          vehicleId === item.id
                        }
                      >
                        <div className="vehicle-info">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.description}
                          </span>

                          <small>
                            {item.seats}
                          </small>
                        </div>

                        <div className="vehicle-price">
                          ₹{itemPrice}/km
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DATE AND TIME */}

            <div className="booking-block">
              <div className="booking-block-header">
                <span>03</span>
                <h2>Date &amp; Time</h2>
              </div>

              <div className="booking-date-row">
                <label>
                  <small>DATE</small>

                  <input
                    type="date"
                    min={(() => {
                      const now = new Date();

                      return [
                        now.getFullYear(),
                        String(now.getMonth() + 1).padStart(
                          2,
                          "0"
                        ),
                        String(now.getDate()).padStart(
                          2,
                          "0"
                        ),
                      ].join("-");
                    })()}
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
                  <small>PICKUP TIME</small>

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

                {isRoadTrip && (
                  <label className="booking-return-time">
                    <small>
                      RETURN TIME (SAME DAY)
                    </small>

                    <input
                      type="time"
                      value={returnTime}
                      min={time || undefined}
                      onChange={(event) => {
                        setReturnTime(event.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                    />
                  </label>
                )}
              </div>

              {isRoadTrip && (
                <p className="booking-field-hint">
                  Select a return time later than your
                  pickup time. Road Trips must return
                  on the same date.
                </p>
              )}
            </div>

            {/* PASSENGERS */}

            <div className="booking-block">
              <div className="booking-block-header">
                <span>04</span>
                <h2>Passengers</h2>
              </div>

              <div className="passenger-control">
                <button
                  type="button"
                  onClick={decreasePassengers}
                  disabled={
                    passengers === 1 || !selectedVehicle
                  }
                  aria-label="Decrease passengers"
                >
                  <Minus size={18} />
                </button>

                <div>
                  <strong>{passengers}</strong>

                  <span>
                    {passengers === 1
                      ? "Passenger"
                      : "Passengers"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={increasePassengers}
                  disabled={
                    !selectedVehicle ||
                    passengers >=
                      selectedVehicle.maxPassengers
                  }
                  aria-label="Increase passengers"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* BOOKING SUMMARY */}

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

                  <strong>
                    {pickup || "Your pickup location"}
                  </strong>
                </div>
              </div>

              <div className="summary-line"></div>

              <div className="summary-location">
                <span className="summary-dot destination-dot"></span>

                <div>
                  <small>DESTINATION</small>

                  <strong>
                    {destination || "Your destination"}
                  </strong>
                </div>
              </div>

              {isRoadTrip && (
                <>
                  <div className="summary-line"></div>

                  <div className="summary-location">
                    <span className="summary-dot pickup-dot"></span>

                    <div>
                      <small>RETURN TO PICKUP</small>

                      <strong>
                        {pickup ||
                          "Original pickup location"}
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="summary-details">
              <div>
                <span>Trip type</span>
                <strong>{tripType}</strong>
              </div>

              <div>
                <span>Vehicle</span>

                <strong>
                  {selectedVehicle?.name || "--"}
                </strong>
              </div>

              <div>
                <span>Passengers</span>
                <strong>{passengers}</strong>
              </div>

              <div>
                <span>Distance</span>

                <strong>
                  {distance !== null
                    ? `${distance.toFixed(1)} km`
                    : "--"}
                </strong>
              </div>

              <div>
                <span>Estimated time</span>

                <strong>
                  {duration !== null
                    ? `${duration} min`
                    : "--"}
                </strong>
              </div>

              {isRoadTrip && (
                <div>
                  <span>Return time</span>
                  <strong>
                    {returnTime || "--"}
                  </strong>
                </div>
              )}
            </div>

            <div className="summary-fare">
              <span>Estimated fare</span>

              <strong>
                {fare !== null
                  ? `₹${fare}`
                  : "--"}
              </strong>

              <small>
                {selectedVehicle
                  ? `Base fare ₹${selectedVehicle.baseFare} + ₹${selectedPricePerKm}/km × ${
                      distance !== null
                        ? distance.toFixed(1)
                        : "--"
                    } km`
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
              {loading
                ? "Submitting..."
                : "Continue Booking"}

              {!loading && (
                <ArrowUpRight size={19} />
              )}
            </button>

            <p className="booking-note">
              Final fare may vary based on the actual
              route and booking conditions.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}

export default Booking;
