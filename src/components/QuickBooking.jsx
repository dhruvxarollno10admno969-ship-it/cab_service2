import { useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuickBooking() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = () => {
    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter pickup and destination");
      return;
    }

    navigate("/booking", {
      state: {
        pickup,
        destination,
      },
    });
  };

  return (
    <div className="booking-card">

      {/* HEADER */}

      <div className="booking-header">
        <div>
          <span>QUICK BOOKING</span>

          <h2>Where are you going?</h2>
        </div>

        <MapPin size={22} />
      </div>


      {/* PICKUP */}

      <div className="location-input">

        <span className="input-dot pickup"></span>

        <div className="location-field">
          <label>Pickup</label>

          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter pickup location"
          />
        </div>

      </div>


      {/* CONNECTING LINE */}

      <div className="location-line"></div>


      {/* DESTINATION */}

      <div className="location-input">

        <span className="input-dot destination"></span>

        <div className="location-field">
          <label>Destination</label>

          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
          />
        </div>

      </div>


      {/* BUTTON */}

      <button
        type="button"
        className="booking-button"
        onClick={handleSubmit}
      >
        Find a Ride
        <ArrowUpRight size={18} />
      </button>

    </div>
  );
}

export default QuickBooking;