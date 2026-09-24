import React, { useMemo, useState } from "react";
import {
  IndianRupee,
  Car,
  Clock3,
  TrendingUp,
  Calculator,
  CircleCheck,
  Users,
  ShieldCheck,
  Moon,
  Plus,
  Minus,
} from "lucide-react";

import "../styles/pricing.css";

const vehiclePricing = [
  {
    id: "sedan",
    type: "Sedan",
    short: "S",
    description: "Standard rides",
    baseFare: 80,
    perKm: 14,
    perMinute: 2,
  },
  {
    id: "suv",
    type: "SUV",
    short: "SUV",
    description: "Family rides",
    baseFare: 120,
    perKm: 18,
    perMinute: 3,
  },
  {
    id: "premium",
    type: "Premium",
    short: "P",
    description: "Luxury rides",
    baseFare: 180,
    perKm: 25,
    perMinute: 4,
  },
];

function Pricing() {
  const [selectedVehicle, setSelectedVehicle] = useState("sedan");
  const [distance, setDistance] = useState(25);

  const [rules, setRules] = useState({
    minimumFare: 80,
    waitingCharge: 2,
    extraPassenger: 50,
    cancellationFee: 100,
  });

  const [peakPricing, setPeakPricing] = useState({
    morning: false,
    evening: false,
  });

  const selectedVehicleData = useMemo(
    () =>
      vehiclePricing.find((vehicle) => vehicle.id === selectedVehicle) ||
      vehiclePricing[0],
    [selectedVehicle]
  );

  const estimatedFare = useMemo(() => {
    const fare =
      selectedVehicleData.baseFare +
      Number(distance || 0) * selectedVehicleData.perKm;

    return Math.max(fare, rules.minimumFare);
  }, [distance, selectedVehicleData, rules.minimumFare]);

  const updateRule = (key, value) => {
    setRules((prev) => ({
      ...prev,
      [key]: Math.max(0, Number(value)),
    }));
  };

  return (
    <div className="pricing-page">
      {/* HEADER */}
      <div className="pricing-header">
        <div>
          <span className="pricing-eyebrow">FARE MANAGEMENT</span>

          <h1>Pricing</h1>

          <p>Manage your cab fares and pricing rules.</p>
        </div>

        <button className="pricing-save-btn">
          <ShieldCheck size={16} />
          Save Changes
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <section className="pricing-overview">
        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Base Fare</span>
            <strong>₹80</strong>
          </div>

          <span className="pricing-stat-change positive">Default</span>
        </div>

        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <TrendingUp size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Per Kilometer</span>
            <strong>₹14</strong>
          </div>

          <span className="pricing-stat-change positive">Standard</span>
        </div>

        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <Calculator size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Average Fare</span>
            <strong>₹1,850</strong>
          </div>

          <span className="pricing-stat-change positive">+8.4%</span>
        </div>

        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Today's Revenue</span>
            <strong>₹12,640</strong>
          </div>

          <span className="pricing-stat-change positive">+14.8%</span>
        </div>
      </section>

      {/* VEHICLE PRICING */}
      <section className="pricing-panel vehicle-pricing-panel">
        <div className="pricing-panel-header">
          <div>
            <h2>Vehicle Pricing</h2>
            <p>Set individual pricing for each vehicle category.</p>
          </div>

          <div className="pricing-panel-badge">
            <Car size={15} />
            3 Categories
          </div>
        </div>

        <div className="pricing-table">
          <div className="pricing-table-head">
            <span>VEHICLE TYPE</span>
            <span>BASE FARE</span>
            <span>PER KM</span>
            <span>PER MINUTE</span>
            <span>STATUS</span>
          </div>

          {vehiclePricing.map((vehicle) => (
            <div className="pricing-table-row" key={vehicle.id}>
              <div className="vehicle-info">
                <div className="vehicle-avatar">{vehicle.short}</div>

                <div>
                  <strong>{vehicle.type}</strong>
                  <span>{vehicle.description}</span>
                </div>
              </div>

              <div className="pricing-input">
                <span>₹</span>
                <input
                  type="number"
                  defaultValue={vehicle.baseFare}
                  min="0"
                />
              </div>

              <div className="pricing-input">
                <span>₹</span>
                <input
                  type="number"
                  defaultValue={vehicle.perKm}
                  min="0"
                />
              </div>

              <div className="pricing-input">
                <span>₹</span>
                <input
                  type="number"
                  defaultValue={vehicle.perMinute}
                  min="0"
                />
                <small>/min</small>
              </div>

              <div className="pricing-active">
                <CircleCheck size={15} />
                Active
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOWER GRID */}
      <section className="pricing-lower-grid">
        {/* PRICING RULES */}
        <div className="pricing-panel rules-panel">
          <div className="pricing-panel-header">
            <div>
              <h2>Pricing Rules</h2>
              <p>Configure additional fare rules.</p>
            </div>

            <div className="small-panel-icon">
              <ShieldCheck size={17} />
            </div>
          </div>

          <div className="rules-list">
            <div className="rule-row">
              <div className="rule-info">
                <strong>Minimum Fare</strong>
                <span>Minimum amount charged per ride</span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  value={rules.minimumFare}
                  onChange={(e) =>
                    updateRule("minimumFare", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="rule-row">
              <div className="rule-info">
                <strong>Waiting Charge</strong>
                <span>Charge applied while waiting</span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  value={rules.waitingCharge}
                  onChange={(e) =>
                    updateRule("waitingCharge", e.target.value)
                  }
                />

                <small>/min</small>
              </div>
            </div>

            <div className="rule-row">
              <div className="rule-info">
                <strong>Extra Passenger</strong>
                <span>Additional passenger charge</span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  value={rules.extraPassenger}
                  onChange={(e) =>
                    updateRule("extraPassenger", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="rule-row">
              <div className="rule-info">
                <strong>Cancellation Fee</strong>
                <span>Fee after cancellation window</span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  value={rules.cancellationFee}
                  onChange={(e) =>
                    updateRule("cancellationFee", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="rule-row disabled-rule">
              <div className="rule-info">
                <div className="rule-title-with-icon">
                  <Moon size={15} />
                  <strong>Night Charge</strong>
                </div>

                <span>Currently disabled</span>
              </div>

              <div className="disabled-badge">Disabled</div>
            </div>
          </div>
        </div>

        {/* FARE CALCULATOR */}
        <div className="pricing-panel calculator-panel">
          <div className="pricing-panel-header">
            <div>
              <h2>Fare Calculator</h2>
              <p>Preview an estimated customer fare.</p>
            </div>

            <div className="calculator-icon">
              <Calculator size={18} />
            </div>
          </div>

          <div className="calculator-form">
            <label>Vehicle</label>

            <div className="select-wrapper">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                {vehiclePricing.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.type}
                  </option>
                ))}
              </select>
            </div>

            <label>Distance</label>

            <div className="distance-input">
              <input
                type="number"
                min="1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />

              <span>KM</span>
            </div>

            <div className="calculator-breakdown">
              <div>
                <span>Base Fare</span>
                <strong>₹{selectedVehicleData.baseFare}</strong>
              </div>

              <div>
                <span>
                  {distance || 0} km × ₹{selectedVehicleData.perKm}
                </span>

                <strong>
                  ₹{Number(distance || 0) * selectedVehicleData.perKm}
                </strong>
              </div>
            </div>

            <div className="estimated-fare">
              <div>
                <span>Estimated Fare</span>
                <small>Before additional charges</small>
              </div>

              <strong>₹{estimatedFare.toLocaleString("en-IN")}</strong>
            </div>

            <button className="calculate-btn">
              <Calculator size={16} />
              Calculate Fare
            </button>
          </div>
        </div>
      </section>

      {/* PEAK PRICING */}
      <section className="pricing-panel peak-panel">
        <div className="pricing-panel-header">
          <div>
            <h2>Peak Hour Pricing</h2>
            <p>Apply additional pricing during high-demand periods.</p>
          </div>

          <div className="peak-status">
            <span></span>
            {peakPricing.morning || peakPricing.evening
              ? "Active"
              : "Inactive"}
          </div>
        </div>

        <div className="peak-grid">
          <div className="peak-card">
            <div className="peak-card-icon">
              <Clock3 size={18} />
            </div>

            <div className="peak-card-content">
              <strong>Morning Peak</strong>
              <span>07:00 AM — 10:00 AM</span>
            </div>

            <div className="peak-controls">
              <strong>+10%</strong>

              <button
                className={`toggle ${
                  peakPricing.morning ? "active" : ""
                }`}
                onClick={() =>
                  setPeakPricing((prev) => ({
                    ...prev,
                    morning: !prev.morning,
                  }))
                }
                aria-label="Toggle morning peak pricing"
              >
                <span></span>
              </button>
            </div>
          </div>

          <div className="peak-card">
            <div className="peak-card-icon">
              <TrendingUp size={18} />
            </div>

            <div className="peak-card-content">
              <strong>Evening Peak</strong>
              <span>05:00 PM — 09:00 PM</span>
            </div>

            <div className="peak-controls">
              <strong>+15%</strong>

              <button
                className={`toggle ${
                  peakPricing.evening ? "active" : ""
                }`}
                onClick={() =>
                  setPeakPricing((prev) => ({
                    ...prev,
                    evening: !prev.evening,
                  }))
                }
                aria-label="Toggle evening peak pricing"
              >
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing;