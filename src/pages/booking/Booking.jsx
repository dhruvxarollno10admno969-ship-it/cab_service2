import { useState } from "react";
import {
  Link,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";

import "./booking.css";


// =====================================================
// VEHICLES
// =====================================================

const vehicles = [
  {
    name: "Sedan",
    description: "Comfortable everyday ride",
    price: 12,
    seats: "4 seats",
    baseFare: 50,
  },

  {
    name: "SUV",
    description: "More space for passengers",
    price: 16,
    seats: "6 seats",
    baseFare: 80,
  },

  {
    name: "Premium",
    description: "Executive travel experience",
    price: 22,
    seats: "4 seats",
    baseFare: 120,
  },
];


// =====================================================
// BOOKING
// =====================================================

function Booking() {

  // ---------------------------------------------------
  // URL PARAMETERS
  // ---------------------------------------------------

  const [searchParams] = useSearchParams();
const location = useLocation();

  // ---------------------------------------------------
  // JOURNEY
  // ---------------------------------------------------

  const [pickup, setPickup] = useState(
  location.state?.pickup || searchParams.get("pickup") || ""
);

  const [destination, setDestination] = useState(
  location.state?.destination || searchParams.get("destination") || ""
);


  // ---------------------------------------------------
  // VEHICLE
  // ---------------------------------------------------

  const [vehicle, setVehicle] = useState("Sedan");


  // ---------------------------------------------------
  // DATE / TIME
  // ---------------------------------------------------

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");


  // ---------------------------------------------------
  // PASSENGERS
  // ---------------------------------------------------

  const [passengers, setPassengers] = useState(1);


  // ---------------------------------------------------
  // ROUTE
  // ---------------------------------------------------

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);


  // ---------------------------------------------------
  // STATUS
  // ---------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ===================================================
  // SELECTED VEHICLE
  // ===================================================

  const selectedVehicle = vehicles.find(
    (item) => item.name === vehicle
  );


  // ===================================================
  // FARE
  // ===================================================

  const fare = distance
    ? Math.ceil(
        selectedVehicle.baseFare +
          distance * selectedVehicle.price
      )
    : null;


  // ===================================================
  // GET COORDINATES
  // ===================================================

  const getCoordinates = async (location) => {

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
        location
      )}`
    );


    if (!response.ok) {
      throw new Error(
        "Location search failed."
      );
    }


    const data = await response.json();


    if (!data.length) {
      throw new Error(
        `Could not find "${location}".`
      );
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

    if (
      !pickup.trim() ||
      !destination.trim()
    ) {

      setError(
        "Enter both pickup and destination."
      );

      return;
    }


    setLoading(true);
    setError("");


    try {

      // -----------------------------------------------
      // PICKUP COORDINATES
      // -----------------------------------------------

      const pickupCoordinates =
        await getCoordinates(pickup);


      // -----------------------------------------------
      // DESTINATION COORDINATES
      // -----------------------------------------------

      const destinationCoordinates =
        await getCoordinates(destination);


      // -----------------------------------------------
      // OSRM ROUTE
      // -----------------------------------------------

      const routeUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${pickupCoordinates.longitude},${pickupCoordinates.latitude};` +
        `${destinationCoordinates.longitude},${destinationCoordinates.latitude}` +
        `?overview=false`;


      const response =
        await fetch(routeUrl);


      if (!response.ok) {
        throw new Error(
          "Route calculation failed."
        );
      }


      const data =
        await response.json();


      if (
        data.code !== "Ok" ||
        !data.routes ||
        !data.routes.length
      ) {

        throw new Error(
          "No driving route was found."
        );
      }


      // -----------------------------------------------
      // ROUTE DATA
      // -----------------------------------------------

      const route =
        data.routes[0];


      const distanceInKm =
        route.distance / 1000;


      const durationInMinutes =
        Math.ceil(
          route.duration / 60
        );


      // -----------------------------------------------
      // SAVE ROUTE
      // -----------------------------------------------

      setDistance(
        distanceInKm
      );

      setDuration(
        durationInMinutes
      );

    } catch (err) {

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
  // VEHICLE
  // ===================================================

  const handleVehicleChange = (
    name
  ) => {

    setVehicle(name);

  };


  // ===================================================
  // PASSENGERS
  // ===================================================

  const decreasePassengers = () => {

    setPassengers(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );

  };


  const increasePassengers = () => {

    setPassengers(
      (current) =>
        Math.min(
          8,
          current + 1
        )
    );

  };


  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();


    if (!pickup.trim()) {

      setError(
        "Please enter a pickup location."
      );

      return;
    }


    if (!destination.trim()) {

      setError(
        "Please enter a destination."
      );

      return;
    }


    if (!distance) {

      setError(
        "Please calculate the route before continuing."
      );

      return;
    }


    if (!date || !time) {

      setError(
        "Please select your date and time."
      );

      return;
    }


    // TEMPORARY TEST

    alert(
      `Ride ready!\n\n` +
      `${pickup} → ${destination}\n\n` +
      `Vehicle: ${selectedVehicle.name}\n` +
      `Passengers: ${passengers}\n` +
      `Distance: ${distance.toFixed(1)} km\n` +
      `Time: ${duration} min\n` +
      `Fare: ₹${fare}`
    );

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <main className="booking-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="booking-header">


        <Link
          to="/"
          className="booking-back"
        >

          <ArrowLeft size={18} />

          Back to Home

        </Link>
      </header>



      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="booking-container">


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="booking-title">


          <p className="eyebrow">

            <span></span>

            BOOK A RIDE

          </p>

          <h1>

            Where are you
            going
            <br />
          </h1>


          <p>

            Enter your journey details and
            we'll calculate the route and
            estimated fare.

          </p>


        </div>



        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="booking-layout"
          onSubmit={handleSubmit}
        >


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="booking-form">


            {/* =================================================
                JOURNEY
            ================================================= */}

            <div className="booking-block">


              <div className="booking-block-header">

                <span>
                  01
                </span>

                <h2>
                  Journey
                </h2>

              </div>



              <div className="location-fields">


                {/* PICKUP */}

                <label className="booking-location">


                  <span
                    className="booking-dot pickup-dot"
                  ></span>


                  <div>

                    <small>
                      FROM
                    </small>


                    <input
                      type="text"
                      value={pickup}
                      onChange={(event) => {

                        setPickup(
                          event.target.value
                        );

                        setDistance(null);

                        setDuration(null);

                        setError("");

                      }}
                      placeholder="e.g. Phagwara"
                      required
                    />

                  </div>


                </label>



                {/* LINE */}

                <div className="booking-location-line"></div>



                {/* DESTINATION */}

                <label className="booking-location">


                  <span
                    className="booking-dot destination-dot"
                  ></span>


                  <div>

                    <small>
                      TO
                    </small>


                    <input
                      type="text"
                      value={destination}
                      onChange={(event) => {

                        setDestination(
                          event.target.value
                        );

                        setDistance(null);

                        setDuration(null);

                        setError("");

                      }}
                      placeholder="e.g. Jalandhar"
                      required
                    />

                  </div>


                </label>



                {/* CALCULATE */}

                <button
                  type="button"
                  className="calculate-route"
                  onClick={
                    calculateRoute
                  }
                  disabled={loading}
                >

                  {loading
                    ? "Calculating route..."
                    : "Calculate Route"}


                  {!loading && (
                    <ArrowUpRight
                      size={17}
                    />
                  )}

                </button>



                {/* ERROR */}

                {error && (

                  <p className="booking-error">

                    {error}

                  </p>

                )}


              </div>


            </div>



            {/* =================================================
                ROUTE RESULT
            ================================================= */}

            {distance && (

              <div className="route-result">


                <div>

                  <span>
                    DISTANCE
                  </span>

                  <strong>
                    {distance.toFixed(1)} km
                  </strong>

                </div>


                <div>

                  <span>
                    EST. TIME
                  </span>

                  <strong>
                    {duration} min
                  </strong>

                </div>


              </div>

            )}



            {/* =================================================
                VEHICLE
            ================================================= */}

            <div className="booking-block">


              <div className="booking-block-header">

                <span>
                  02
                </span>

                <h2>
                  Choose your ride
                </h2>

              </div>



              <div className="vehicle-options">


                {vehicles.map(
                  (item) => (

                    <button
                      key={item.name}
                      type="button"
                      className={`vehicle-option ${
                        vehicle === item.name
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleVehicleChange(
                          item.name
                        )
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

                        ₹{item.price}/km

                      </div>


                    </button>

                  )
                )}


              </div>


            </div>



            {/* =================================================
                DATE / TIME
            ================================================= */}

            <div className="booking-block">


              <div className="booking-block-header">

                <span>
                  03
                </span>

                <h2>
                  Date & Time
                </h2>

              </div>



              <div className="booking-date-row">


                {/* DATE */}

                <label>

                  <small>
                    DATE
                  </small>


                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                    required
                  />

                </label>



                {/* TIME */}

                <label>

                  <small>
                    TIME
                  </small>


                  <input
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setTime(
                        event.target.value
                      )
                    }
                    required
                  />

                </label>


              </div>


            </div>



            {/* =================================================
                PASSENGERS
            ================================================= */}

            <div className="booking-block">


              <div className="booking-block-header">

                <span>
                  04
                </span>

                <h2>
                  Passengers
                </h2>

              </div>



              <div className="passenger-control">


                <button
                  type="button"
                  onClick={
                    decreasePassengers
                  }
                  disabled={
                    passengers === 1
                  }
                >

                  <Minus size={18} />

                </button>



                <div>

                  <strong>
                    {passengers}
                  </strong>


                  <span>

                    {passengers === 1
                      ? "Passenger"
                      : "Passengers"}

                  </span>

                </div>



                <button
                  type="button"
                  onClick={
                    increasePassengers
                  }
                  disabled={
                    passengers === 8
                  }
                >

                  <Plus size={18} />

                </button>


              </div>


            </div>


          </div>



          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="booking-summary">


            {/* TOP */}

            <div className="summary-top">

              <span>
                YOUR JOURNEY
              </span>

              <MapPin size={20} />

            </div>



            {/* ROUTE */}

            <div className="summary-route">


              {/* PICKUP */}

              <div className="summary-location">


                <span
                  className="summary-dot pickup-dot"
                ></span>


                <div>

                  <small>
                    PICKUP
                  </small>


                  <strong>

                    {pickup ||
                      "Your pickup location"}

                  </strong>

                </div>


              </div>



              <div className="summary-line"></div>



              {/* DESTINATION */}

              <div className="summary-location">


                <span
                  className="summary-dot destination-dot"
                ></span>


                <div>

                  <small>
                    DESTINATION
                  </small>


                  <strong>

                    {destination ||
                      "Your destination"}

                  </strong>

                </div>


              </div>


            </div>



            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="summary-details">


              <div>

                <span>
                  Vehicle
                </span>

                <strong>
                  {selectedVehicle.name}
                </strong>

              </div>


              <div>

                <span>
                  Passengers
                </span>

                <strong>
                  {passengers}
                </strong>

              </div>


              <div>

                <span>
                  Distance
                </span>

                <strong>

                  {distance
                    ? `${distance.toFixed(
                        1
                      )} km`
                    : "--"}

                </strong>

              </div>


              <div>

                <span>
                  Time
                </span>

                <strong>

                  {duration
                    ? `${duration} min`
                    : "--"}

                </strong>

              </div>


            </div>



            {/* =================================================
                FARE
            ================================================= */}

            <div className="summary-fare">


              <span>
                Estimated fare
              </span>


              <strong>

                {fare
                  ? `₹${fare}`
                  : "--"}

              </strong>


              <small>

                Base fare ₹
                {selectedVehicle.baseFare}

                {" + "}

                ₹
                {selectedVehicle.price}
                /km

              </small>


            </div>



            {/* =================================================
                CONTINUE
            ================================================= */}

            <button
              type="submit"
              className="confirm-booking"
            >

              Continue Booking

              <ArrowUpRight
                size={19}
              />

            </button>



            <p className="booking-note">

              Final fare may vary based on
              the actual route and booking
              conditions.

            </p>


          </aside>


        </form>


      </section>


    </main>

  );
}


export default Booking;