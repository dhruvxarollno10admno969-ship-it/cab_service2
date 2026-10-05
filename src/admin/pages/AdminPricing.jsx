import React, { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Car,
  Clock3,
  TrendingUp,
  Calculator,
  CircleCheck,
  ShieldCheck,
  Moon,
} from "lucide-react";

import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";
import "../styles/pricing.css";

/*
|--------------------------------------------------------------------------
| DEFAULT FIREBASE DATA
|--------------------------------------------------------------------------
| These values are only used when the pricing documents do not exist yet.
| After Firebase has the documents, the page reads/writes real data.
*/

const DEFAULT_VEHICLES = [
  {
    id: "sedan",
    type: "Sedan",
    short: "S",
    description: "Standard rides",
    baseFare: 80,
    perKm: 14,
    perMinute: 2,
    active: true,
  },
  {
    id: "suv",
    type: "SUV",
    short: "SUV",
    description: "Family rides",
    baseFare: 120,
    perKm: 18,
    perMinute: 3,
    active: true,
  },
  {
    id: "premium",
    type: "Premium",
    short: "P",
    description: "Luxury rides",
    baseFare: 180,
    perKm: 25,
    perMinute: 4,
    active: true,
  },
];

const DEFAULT_SETTINGS = {
  minimumFare: 80,
  waitingCharge: 2,
  extraPassenger: 50,
  cancellationFee: 100,

  nightChargeEnabled: false,
  nightCharge: 0,

  morningPeakEnabled: false,
  morningPeakPercent: 10,

  eveningPeakEnabled: false,
  eveningPeakPercent: 15,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getDateFromValue = (value) => {
  if (!value) return null;

  if (value?.toDate && typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (value?.seconds) {
    return new Date(value.seconds * 1000);
  }

  return null;
};

const getBookingDate = (booking) => {
  return (
    getDateFromValue(booking.createdAt) ||
    getDateFromValue(booking.bookingDate) ||
    getDateFromValue(booking.date) ||
    getDateFromValue(booking.timestamp) ||
    getDateFromValue(booking.updatedAt)
  );
};

const getBookingFare = (booking) => {
  return toNumber(
    booking.fare ??
      booking.totalFare ??
      booking.finalFare ??
      booking.amount ??
      booking.totalAmount ??
      booking.price ??
      0
  );
};

const isCompletedBooking = (booking) => {
  const status = String(
    booking.status ??
      booking.bookingStatus ??
      booking.rideStatus ??
      ""
  ).toLowerCase();

  return [
    "completed",
    "complete",
    "finished",
    "success",
    "successful",
  ].includes(status);
};

const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const isYesterday = (date, today) => {
  if (!date || !today) return false;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return isSameDay(date, yesterday);
};

const calculatePercentageChange = (current, previous) => {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

/*
|--------------------------------------------------------------------------
| PRICING COMPONENT
|--------------------------------------------------------------------------
*/

function Pricing() {
  const [vehicles, setVehicles] = useState([]);
  const [rules, setRules] = useState(DEFAULT_SETTINGS);

  const [bookings, setBookings] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("sedan");
  const [distance, setDistance] = useState(25);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | REAL-TIME VEHICLE PRICING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const pricingRef = collection(db, "pricingCategories");

    const unsubscribe = onSnapshot(
      pricingRef,
      async (snapshot) => {
        if (snapshot.empty) {
          /*
           * Create the initial pricing documents only once.
           */
          try {
            await Promise.all(
              DEFAULT_VEHICLES.map((vehicle) =>
                setDoc(doc(db, "pricingCategories", vehicle.id), {
                  id: vehicle.id,
                  type: vehicle.type,
                  short: vehicle.short,
                  description: vehicle.description,
                  baseFare: vehicle.baseFare,
                  perKm: vehicle.perKm,
                  perMinute: vehicle.perMinute,
                  active: vehicle.active,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                })
              )
            );
          } catch (error) {
            console.error(
              "Error creating default pricing:",
              error
            );
          }

          setVehicles(DEFAULT_VEHICLES);
          setLoading(false);
          return;
        }

        const pricingList = snapshot.docs
          .map((pricingDoc) => ({
            firebaseId: pricingDoc.id,
            ...pricingDoc.data(),
          }))
          .sort((a, b) => {
            const order = {
              sedan: 1,
              suv: 2,
              premium: 3,
            };

            return (
              (order[a.id] || 99) -
              (order[b.id] || 99)
            );
          });

        setVehicles(pricingList);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Pricing realtime listener error:",
          error
        );

        setMessage(
          "Unable to load pricing data from Firebase."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | REAL-TIME PRICING SETTINGS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const settingsRef = doc(db, "settings", "pricing");

    const unsubscribe = onSnapshot(
      settingsRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          try {
            await setDoc(settingsRef, {
              ...DEFAULT_SETTINGS,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            setRules(DEFAULT_SETTINGS);
          } catch (error) {
            console.error(
              "Error creating pricing settings:",
              error
            );
          }

          return;
        }

        setRules({
          ...DEFAULT_SETTINGS,
          ...snapshot.data(),
        });
      },
      (error) => {
        console.error(
          "Pricing settings listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | REAL-TIME BOOKINGS
  |--------------------------------------------------------------------------
  | Used for:
  | - Average Fare
  | - Today's Revenue
  | - Percentage comparisons
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const bookingsRef = collection(db, "bookings");

    const unsubscribe = onSnapshot(
      bookingsRef,
      (snapshot) => {
        const bookingList = snapshot.docs.map(
          (bookingDoc) => ({
            firebaseId: bookingDoc.id,
            ...bookingDoc.data(),
          })
        );

        setBookings(bookingList);
      },
      (error) => {
        console.error(
          "Bookings realtime listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SELECTED VEHICLE
  |--------------------------------------------------------------------------
  */

  const selectedVehicleData = useMemo(() => {
    return (
      vehicles.find(
        (vehicle) => vehicle.id === selectedVehicle
      ) ||
      vehicles[0] ||
      DEFAULT_VEHICLES[0]
    );
  }, [vehicles, selectedVehicle]);

  /*
  |--------------------------------------------------------------------------
  | FARE CALCULATOR
  |--------------------------------------------------------------------------
  */

  const estimatedFare = useMemo(() => {
    const baseFare = toNumber(
      selectedVehicleData?.baseFare
    );

    const perKm = toNumber(
      selectedVehicleData?.perKm
    );

    const calculatedFare =
      baseFare +
      toNumber(distance) * perKm;

    return Math.max(
      calculatedFare,
      toNumber(rules.minimumFare)
    );
  }, [
    distance,
    selectedVehicleData,
    rules.minimumFare,
  ]);

  /*
  |--------------------------------------------------------------------------
  | TODAY / YESTERDAY STATS
  |--------------------------------------------------------------------------
  */

  const bookingStats = useMemo(() => {
    const now = new Date();

    const todayBookings = bookings.filter((booking) => {
      const bookingDate = getBookingDate(booking);

      return (
        bookingDate &&
        isSameDay(bookingDate, now) &&
        isCompletedBooking(booking)
      );
    });

    const yesterdayBookings = bookings.filter(
      (booking) => {
        const bookingDate = getBookingDate(booking);

        return (
          bookingDate &&
          isYesterday(bookingDate, now) &&
          isCompletedBooking(booking)
        );
      }
    );

    const todayRevenue = todayBookings.reduce(
      (total, booking) =>
        total + getBookingFare(booking),
      0
    );

    const yesterdayRevenue =
      yesterdayBookings.reduce(
        (total, booking) =>
          total + getBookingFare(booking),
        0
      );

    const todayAverageFare =
      todayBookings.length > 0
        ? todayRevenue / todayBookings.length
        : 0;

    const yesterdayAverageFare =
      yesterdayBookings.length > 0
        ? yesterdayRevenue /
          yesterdayBookings.length
        : 0;

    return {
      todayRevenue,
      yesterdayRevenue,
      todayAverageFare,
      yesterdayAverageFare,
      todayBookingCount: todayBookings.length,
      yesterdayBookingCount:
        yesterdayBookings.length,
    };
  }, [bookings]);

  const averageFareChange = useMemo(() => {
    return calculatePercentageChange(
      bookingStats.todayAverageFare,
      bookingStats.yesterdayAverageFare
    );
  }, [bookingStats]);

  const revenueChange = useMemo(() => {
    return calculatePercentageChange(
      bookingStats.todayRevenue,
      bookingStats.yesterdayRevenue
    );
  }, [bookingStats]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE RULE LOCALLY
  |--------------------------------------------------------------------------
  */

  const updateRule = (key, value) => {
    setRules((prev) => ({
      ...prev,
      [key]: Math.max(0, toNumber(value)),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE VEHICLE PRICING LOCALLY
  |--------------------------------------------------------------------------
  */

  const updateVehicle = (vehicleId, field, value) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              [field]: Math.max(
                0,
                toNumber(value)
              ),
            }
          : vehicle
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE ALL CHANGES
  |--------------------------------------------------------------------------
  */

  const saveChanges = async () => {
    try {
      setSaving(true);
      setMessage("");

      /*
       * Save all vehicle categories.
       */
      await Promise.all(
        vehicles.map((vehicle) =>
          setDoc(
            doc(
              db,
              "pricingCategories",
              vehicle.id
            ),
            {
              id: vehicle.id,
              type: vehicle.type,
              short: vehicle.short,
              description: vehicle.description,
              baseFare: toNumber(
                vehicle.baseFare
              ),
              perKm: toNumber(vehicle.perKm),
              perMinute: toNumber(
                vehicle.perMinute
              ),
              active:
                vehicle.active !== false,
              updatedAt: serverTimestamp(),
            },
            {
              merge: true,
            }
          )
        )
      );

      /*
       * Save pricing rules + peak settings.
       */
      await setDoc(
        doc(db, "settings", "pricing"),
        {
          minimumFare: toNumber(
            rules.minimumFare
          ),
          waitingCharge: toNumber(
            rules.waitingCharge
          ),
          extraPassenger: toNumber(
            rules.extraPassenger
          ),
          cancellationFee: toNumber(
            rules.cancellationFee
          ),

          nightChargeEnabled:
            Boolean(
              rules.nightChargeEnabled
            ),

          nightCharge: toNumber(
            rules.nightCharge
          ),

          morningPeakEnabled:
            Boolean(
              rules.morningPeakEnabled
            ),

          morningPeakPercent: toNumber(
            rules.morningPeakPercent
          ),

          eveningPeakEnabled:
            Boolean(
              rules.eveningPeakEnabled
            ),

          eveningPeakPercent: toNumber(
            rules.eveningPeakPercent
          ),

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setMessage(
        "Pricing changes saved successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Error saving pricing:",
        error
      );

      setMessage(
        "Failed to save pricing changes."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PEAK PRICING
  |--------------------------------------------------------------------------
  */

  const morningPeakActive =
    Boolean(
      rules.morningPeakEnabled
    );

  const eveningPeakActive =
    Boolean(
      rules.eveningPeakEnabled
    );

  const peakPricingActive =
    morningPeakActive ||
    eveningPeakActive;

  /*
  |--------------------------------------------------------------------------
  | OVERVIEW VALUES
  |--------------------------------------------------------------------------
  */

  const defaultVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle.id === "sedan"
    ) ||
    vehicles[0] ||
    DEFAULT_VEHICLES[0];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="pricing-header">
          <div>
            <span className="pricing-eyebrow">
              FARE MANAGEMENT
            </span>

            <h1>Pricing</h1>

            <p>
              Loading pricing data...
            </p>
          </div>
        </div>

        <div className="pricing-panel">
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading Firebase pricing...
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="pricing-page">
      {/* HEADER */}
      <div className="pricing-header">
        <div>
          <span className="pricing-eyebrow">
            FARE MANAGEMENT
          </span>

          <h1>Pricing</h1>

          <p>
            Manage your cab fares and pricing
            rules.
          </p>
        </div>

        <button
          className="pricing-save-btn"
          onClick={saveChanges}
          disabled={saving}
        >
          <ShieldCheck size={16} />

          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>

      {/* SAVE MESSAGE */}
      {message && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background:
              "rgba(34, 197, 94, 0.10)",
            border:
              "1px solid rgba(34, 197, 94, 0.25)",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* OVERVIEW CARDS */}
      <section className="pricing-overview">
        {/* BASE FARE */}
        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Base Fare</span>

            <strong>
              ₹
              {toNumber(
                defaultVehicle.baseFare
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <span className="pricing-stat-change positive">
            Default
          </span>
        </div>

        {/* PER KM */}
        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <TrendingUp size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Per Kilometer</span>

            <strong>
              ₹
              {toNumber(
                defaultVehicle.perKm
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <span className="pricing-stat-change positive">
            Standard
          </span>
        </div>

        {/* AVERAGE FARE */}
        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <Calculator size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>Average Fare</span>

            <strong>
              ₹
              {Math.round(
                bookingStats.todayAverageFare
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <span
            className={`pricing-stat-change ${
              averageFareChange >= 0
                ? "positive"
                : ""
            }`}
          >
            {averageFareChange >= 0
              ? "+"
              : ""}
            {averageFareChange.toFixed(1)}%
          </span>
        </div>

        {/* TODAY REVENUE */}
        <div className="pricing-stat-card">
          <div className="pricing-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div className="pricing-stat-content">
            <span>
              Today's Revenue
            </span>

            <strong>
              ₹
              {Math.round(
                bookingStats.todayRevenue
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <span
            className={`pricing-stat-change ${
              revenueChange >= 0
                ? "positive"
                : ""
            }`}
          >
            {revenueChange >= 0
              ? "+"
              : ""}
            {revenueChange.toFixed(1)}%
          </span>
        </div>
      </section>

      {/* VEHICLE PRICING */}
      <section className="pricing-panel vehicle-pricing-panel">
        <div className="pricing-panel-header">
          <div>
            <h2>Vehicle Pricing</h2>

            <p>
              Set individual pricing for each
              vehicle category.
            </p>
          </div>

          <div className="pricing-panel-badge">
            <Car size={15} />

            {vehicles.length} Categories
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

          {vehicles.map((vehicle) => (
            <div
              className="pricing-table-row"
              key={vehicle.id}
            >
              <div className="vehicle-info">
                <div className="vehicle-avatar">
                  {vehicle.short ||
                    vehicle.type?.charAt(0) ||
                    "V"}
                </div>

                <div>
                  <strong>
                    {vehicle.type}
                  </strong>

                  <span>
                    {vehicle.description}
                  </span>
                </div>
              </div>

              {/* BASE FARE */}
              <div className="pricing-input">
                <span>₹</span>

                <input
                  type="number"
                  value={toNumber(
                    vehicle.baseFare
                  )}
                  min="0"
                  onChange={(e) =>
                    updateVehicle(
                      vehicle.id,
                      "baseFare",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* PER KM */}
              <div className="pricing-input">
                <span>₹</span>

                <input
                  type="number"
                  value={toNumber(
                    vehicle.perKm
                  )}
                  min="0"
                  onChange={(e) =>
                    updateVehicle(
                      vehicle.id,
                      "perKm",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* PER MINUTE */}
              <div className="pricing-input">
                <span>₹</span>

                <input
                  type="number"
                  value={toNumber(
                    vehicle.perMinute
                  )}
                  min="0"
                  onChange={(e) =>
                    updateVehicle(
                      vehicle.id,
                      "perMinute",
                      e.target.value
                    )
                  }
                />

                <small>/min</small>
              </div>

              {/* STATUS */}
              <div className="pricing-active">
                <CircleCheck size={15} />

                {vehicle.active === false
                  ? "Inactive"
                  : "Active"}
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

              <p>
                Configure additional fare
                rules.
              </p>
            </div>

            <div className="small-panel-icon">
              <ShieldCheck size={17} />
            </div>
          </div>

          <div className="rules-list">
            {/* MINIMUM FARE */}
            <div className="rule-row">
              <div className="rule-info">
                <strong>
                  Minimum Fare
                </strong>

                <span>
                  Minimum amount charged per
                  ride
                </span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={toNumber(
                    rules.minimumFare
                  )}
                  onChange={(e) =>
                    updateRule(
                      "minimumFare",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* WAITING CHARGE */}
            <div className="rule-row">
              <div className="rule-info">
                <strong>
                  Waiting Charge
                </strong>

                <span>
                  Charge applied while
                  waiting
                </span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={toNumber(
                    rules.waitingCharge
                  )}
                  onChange={(e) =>
                    updateRule(
                      "waitingCharge",
                      e.target.value
                    )
                  }
                />

                <small>/min</small>
              </div>
            </div>

            {/* EXTRA PASSENGER */}
            <div className="rule-row">
              <div className="rule-info">
                <strong>
                  Extra Passenger
                </strong>

                <span>
                  Additional passenger
                  charge
                </span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={toNumber(
                    rules.extraPassenger
                  )}
                  onChange={(e) =>
                    updateRule(
                      "extraPassenger",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* CANCELLATION */}
            <div className="rule-row">
              <div className="rule-info">
                <strong>
                  Cancellation Fee
                </strong>

                <span>
                  Fee after cancellation
                  window
                </span>
              </div>

              <div className="rule-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={toNumber(
                    rules.cancellationFee
                  )}
                  onChange={(e) =>
                    updateRule(
                      "cancellationFee",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* NIGHT CHARGE */}
            <div className="rule-row">
              <div className="rule-info">
                <div className="rule-title-with-icon">
                  <Moon size={15} />

                  <strong>
                    Night Charge
                  </strong>
                </div>

                <span>
                  Additional charge during
                  night hours
                </span>
              </div>

              <div
                className="peak-controls"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div className="rule-input">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    value={toNumber(
                      rules.nightCharge
                    )}
                    disabled={
                      !rules.nightChargeEnabled
                    }
                    onChange={(e) =>
                      updateRule(
                        "nightCharge",
                        e.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    rules.nightChargeEnabled
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRules((prev) => ({
                      ...prev,
                      nightChargeEnabled:
                        !prev.nightChargeEnabled,
                    }))
                  }
                  aria-label="Toggle night charge"
                >
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FARE CALCULATOR */}
        <div className="pricing-panel calculator-panel">
          <div className="pricing-panel-header">
            <div>
              <h2>Fare Calculator</h2>

              <p>
                Preview an estimated customer
                fare.
              </p>
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
                onChange={(e) =>
                  setSelectedVehicle(
                    e.target.value
                  )
                }
              >
                {vehicles
                  .filter(
                    (vehicle) =>
                      vehicle.active !== false
                  )
                  .map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
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
                onChange={(e) =>
                  setDistance(
                    e.target.value
                  )
                }
              />

              <span>KM</span>
            </div>

            <div className="calculator-breakdown">
              <div>
                <span>Base Fare</span>

                <strong>
                  ₹
                  {toNumber(
                    selectedVehicleData.baseFare
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {distance || 0} km × ₹
                  {toNumber(
                    selectedVehicleData.perKm
                  )}
                </span>

                <strong>
                  ₹
                  {(
                    toNumber(distance) *
                    toNumber(
                      selectedVehicleData.perKm
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Minimum Fare
                </span>

                <strong>
                  ₹
                  {toNumber(
                    rules.minimumFare
                  )}
                </strong>
              </div>
            </div>

            <div className="estimated-fare">
              <div>
                <span>
                  Estimated Fare
                </span>

                <small>
                  Before additional charges
                </small>
              </div>

              <strong>
                ₹
                {Math.round(
                  estimatedFare
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <button
              type="button"
              className="calculate-btn"
              onClick={() => {
                setMessage(
                  `Estimated fare: ₹${Math.round(
                    estimatedFare
                  ).toLocaleString("en-IN")}`
                );

                setTimeout(() => {
                  setMessage("");
                }, 3000);
              }}
            >
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

            <p>
              Apply additional pricing during
              high-demand periods.
            </p>
          </div>

          <div className="peak-status">
            <span></span>

            {peakPricingActive
              ? "Active"
              : "Inactive"}
          </div>
        </div>

        <div className="peak-grid">
          {/* MORNING */}
          <div className="peak-card">
            <div className="peak-card-icon">
              <Clock3 size={18} />
            </div>

            <div className="peak-card-content">
              <strong>
                Morning Peak
              </strong>

              <span>
                07:00 AM — 10:00 AM
              </span>
            </div>

            <div className="peak-controls">
              <strong>
                +
                {toNumber(
                  rules.morningPeakPercent
                )}
                %
              </strong>

              <button
                type="button"
                className={`toggle ${
                  morningPeakActive
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRules((prev) => ({
                    ...prev,
                    morningPeakEnabled:
                      !prev.morningPeakEnabled,
                  }))
                }
                aria-label="Toggle morning peak pricing"
              >
                <span></span>
              </button>
            </div>
          </div>

          {/* EVENING */}
          <div className="peak-card">
            <div className="peak-card-icon">
              <TrendingUp size={18} />
            </div>

            <div className="peak-card-content">
              <strong>
                Evening Peak
              </strong>

              <span>
                05:00 PM — 09:00 PM
              </span>
            </div>

            <div className="peak-controls">
              <strong>
                +
                {toNumber(
                  rules.eveningPeakPercent
                )}
                %
              </strong>

              <button
                type="button"
                className={`toggle ${
                  eveningPeakActive
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRules((prev) => ({
                    ...prev,
                    eveningPeakEnabled:
                      !prev.eveningPeakEnabled,
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