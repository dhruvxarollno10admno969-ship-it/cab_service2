import { useState } from "react";
import {
  IndianRupee,
  Save,
  Clock3,
  Plane,
  Timer,
} from "lucide-react";

import "../styles/pricing.css";

function AdminPricing() {
  const [pricing, setPricing] = useState({
    baseFare: 80,
    perKm: 14,
    nightCharge: 50,

    sedanBase: 80,
    sedanKm: 14,
    sedanMinute: 2,

    suvBase: 120,
    suvKm: 18,
    suvMinute: 3,

    premiumBase: 180,
    premiumKm: 25,
    premiumMinute: 4,

    airportCharge: 100,
    waitingCharge: 3,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPricing((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Pricing saved:", pricing);

    alert("Pricing changes saved successfully!");
  };

  return (
    <div className="pricing-page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="pricing-header">

        <div>
          <span className="pricing-eyebrow">
            FARE MANAGEMENT
          </span>

          <h1>Pricing</h1>

          <p>
            Manage your cab fares and pricing rules.
          </p>
        </div>

      </div>


      {/* =================================
          SUMMARY CARDS
      ================================= */}

      <div className="pricing-summary">

        <div className="pricing-summary-card">

          <div className="pricing-summary-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Base Fare</span>

            <strong>
              ₹{pricing.baseFare}
            </strong>
          </div>

        </div>


        <div className="pricing-summary-card">

          <div className="pricing-summary-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Per Kilometer</span>

            <strong>
              ₹{pricing.perKm}
            </strong>
          </div>

        </div>


       

      </div>


      {/* =================================
          VEHICLE PRICING
      ================================= */}

      <section className="pricing-section">

        <div className="pricing-section-header">

          <div>
            <h2>Vehicle Pricing</h2>

            <p>
              Set individual pricing for each vehicle category.
            </p>
          </div>

        </div>


        <div className="pricing-table-wrapper">

          <table className="pricing-table">

            <thead>
              <tr>
                <th>VEHICLE TYPE</th>
                <th>BASE FARE</th>
                <th>PER KM</th>
                <th>PER MINUTE</th>
              </tr>
            </thead>

            <tbody>

              {/* SEDAN */}

              <tr>

                <td>
                  <div className="pricing-vehicle">
                    <div className="pricing-vehicle-icon">
                      <span>S</span>
                    </div>

                    <div>
                      <strong>Sedan</strong>
                      <span>Standard rides</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="sedanBase"
                      value={pricing.sedanBase}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="sedanKm"
                      value={pricing.sedanKm}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="sedanMinute"
                      value={pricing.sedanMinute}
                      onChange={handleChange}
                    />

                    <small>/min</small>
                  </div>
                </td>

              </tr>


              {/* SUV */}

              <tr>

                <td>
                  <div className="pricing-vehicle">
                    <div className="pricing-vehicle-icon">
                      <span>SUV</span>
                    </div>

                    <div>
                      <strong>SUV</strong>
                      <span>Family rides</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="suvBase"
                      value={pricing.suvBase}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="suvKm"
                      value={pricing.suvKm}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="suvMinute"
                      value={pricing.suvMinute}
                      onChange={handleChange}
                    />

                    <small>/min</small>
                  </div>
                </td>

              </tr>


              {/* PREMIUM */}

              <tr>

                <td>
                  <div className="pricing-vehicle">
                    <div className="pricing-vehicle-icon">
                      <span>P</span>
                    </div>

                    <div>
                      <strong>Premium</strong>
                      <span>Luxury rides</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="premiumBase"
                      value={pricing.premiumBase}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="premiumKm"
                      value={pricing.premiumKm}
                      onChange={handleChange}
                    />
                  </div>
                </td>

                <td>
                  <div className="pricing-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="premiumMinute"
                      value={pricing.premiumMinute}
                      onChange={handleChange}
                    />

                    <small>/min</small>
                  </div>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>

</div>
  )};

export default AdminPricing;