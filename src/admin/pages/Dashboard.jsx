import { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck,
  Users,
  UserRoundCog,
  Car,
  IndianRupee,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase";

function Dashboard() {
  /* =====================================================
     STATE
  ===================================================== */

  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");

  const [chartPeriod, setChartPeriod] = useState("7");


  /* =====================================================
     REAL-TIME FIRESTORE DATA
  ===================================================== */

  useEffect(() => {
    setLoading(true);
    setFirebaseError("");

    let customersLoaded = false;
    let bookingsLoaded = false;
    let driversLoaded = false;
    let vehiclesLoaded = false;

    const checkLoading = () => {
      if (
        customersLoaded &&
        bookingsLoaded &&
        driversLoaded &&
        vehiclesLoaded
      ) {
        setLoading(false);
      }
    };


    /* ================= CUSTOMERS ================= */

    const unsubscribeCustomers = onSnapshot(
      collection(db, "customers"),

      (snapshot) => {
        const customerData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCustomers(customerData);

        customersLoaded = true;
        checkLoading();
      },

      (error) => {
        console.error(
          "Customers Firestore error:",
          error
        );

        setFirebaseError(
          "Unable to load customers from Firebase."
        );

        customersLoaded = true;
        checkLoading();
      }
    );


    /* ================= BOOKINGS ================= */

    const unsubscribeBookings = onSnapshot(
      collection(db, "bookings"),

      (snapshot) => {
        const bookingData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(bookingData);

        bookingsLoaded = true;
        checkLoading();
      },

      (error) => {
        console.error(
          "Bookings Firestore error:",
          error
        );

        setFirebaseError(
          "Unable to load bookings from Firebase."
        );

        bookingsLoaded = true;
        checkLoading();
      }
    );


    /* ================= DRIVERS ================= */

    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),

      (snapshot) => {
        const driverData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDrivers(driverData);

        driversLoaded = true;
        checkLoading();
      },

      (error) => {
        console.error(
          "Drivers Firestore error:",
          error
        );

        setFirebaseError(
          "Unable to load drivers from Firebase."
        );

        driversLoaded = true;
        checkLoading();
      }
    );


    /* ================= VEHICLES ================= */

    const unsubscribeVehicles = onSnapshot(
      collection(db, "vehicles"),

      (snapshot) => {
        const vehicleData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVehicles(vehicleData);

        vehiclesLoaded = true;
        checkLoading();
      },

      (error) => {
        console.error(
          "Vehicles Firestore error:",
          error
        );

        setFirebaseError(
          "Unable to load vehicles from Firebase."
        );

        vehiclesLoaded = true;
        checkLoading();
      }
    );


    /* ================= CLEANUP ================= */

    return () => {
      unsubscribeCustomers();
      unsubscribeBookings();
      unsubscribeDrivers();
      unsubscribeVehicles();
    };
  }, []);


  /* =====================================================
     DATE FORMATTER
  ===================================================== */

  const formatDate = (value) => {
    if (!value) return null;

    try {
      if (value?.toDate) {
        return value.toDate();
      }

      if (value instanceof Date) {
        return value;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  };


  /* =====================================================
     SORT BOOKINGS
  ===================================================== */

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const dateA =
        formatDate(
          a.createdAt ||
            a.bookingDate ||
            a.date
        )?.getTime() || 0;

      const dateB =
        formatDate(
          b.createdAt ||
            b.bookingDate ||
            b.date
        )?.getTime() || 0;

      return dateB - dateA;
    });
  }, [bookings]);


  /* =====================================================
     TOTAL REVENUE
  ===================================================== */

  const totalRevenue = useMemo(() => {
    return bookings.reduce((total, booking) => {
      const fare =
        booking.fare ??
        booking.price ??
        booking.amount ??
        booking.totalAmount ??
        0;

      const numericFare = Number(
        String(fare).replace(/[₹,\s]/g, "")
      );

      return total + (Number.isFinite(numericFare)
        ? numericFare
        : 0);
    }, 0);
  }, [bookings]);


  /* =====================================================
     ACTIVE DRIVERS
  ===================================================== */

  const activeDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const status = String(
        driver.status || driver.driverStatus || ""
      ).toLowerCase();

      return (
        status === "active" ||
        status === "available" ||
        status === "online"
      );
    }).length;
  }, [drivers]);


  /* =====================================================
     VEHICLE GROUPS
  ===================================================== */

  const vehicleGroups = useMemo(() => {
    const groups = {};

    vehicles.forEach((vehicle) => {
      const type =
        vehicle.type ||
        vehicle.vehicleType ||
        vehicle.category ||
        "Other";

      const normalizedType =
        String(type).trim();

      if (!groups[normalizedType]) {
        groups[normalizedType] = {
          total: 0,
          available: 0,
        };
      }

      groups[normalizedType].total += 1;

      const status = String(
        vehicle.status || ""
      ).toLowerCase();

      if (
        status === "available" ||
        status === "active"
      ) {
        groups[normalizedType].available += 1;
      }
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .slice(0, 3);
  }, [vehicles]);


  /* =====================================================
     LAST 7 DAYS CHART
  ===================================================== */

  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();

    const numberOfDays =
      Number(chartPeriod);

    for (
      let i = numberOfDays - 1;
      i >= 0;
      i--
    ) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        today.getDate() - i
      );

      const count = bookings.filter(
        (booking) => {
          const bookingDate =
            formatDate(
              booking.createdAt ||
                booking.bookingDate ||
                booking.date
            );

          if (!bookingDate) {
            return false;
          }

          return (
            bookingDate.getFullYear() ===
              date.getFullYear() &&
            bookingDate.getMonth() ===
              date.getMonth() &&
            bookingDate.getDate() ===
              date.getDate()
          );
        }
      ).length;

      days.push({
        date,
        count,
        label: date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),
      });
    }

    return days;
  }, [bookings, chartPeriod]);


  /* =====================================================
     CHART MAX
  ===================================================== */

  const chartMax = Math.max(
    ...chartData.map((item) => item.count),
    1
  );


  /* =====================================================
     CURRENT DATE
  ===================================================== */

  const currentDate =
    new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );


  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length.toLocaleString("en-IN"),
      change: "LIVE",
      icon: CalendarCheck,
    },

    {
      title: "Customers",
      value: customers.length.toLocaleString("en-IN"),
      change: "LIVE",
      icon: Users,
    },

    {
      title: "Active Drivers",
      value: activeDrivers.toLocaleString("en-IN"),
      change: "LIVE",
      icon: UserRoundCog,
    },

    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString(
        "en-IN"
      )}`,
      change: "LIVE",
      icon: IndianRupee,
    },
  ];


  /* =====================================================
     BOOKING HELPERS
  ===================================================== */

  const getCustomerName = (booking) => {
    return (
      booking.customerName ||
      booking.name ||
      booking.customer ||
      "Unknown Customer"
    );
  };


  const getPickup = (booking) => {
    return (
      booking.pickup ||
      booking.pickupLocation ||
      booking.from ||
      booking.source ||
      "-"
    );
  };


  const getDestination = (booking) => {
    return (
      booking.destination ||
      booking.dropoff ||
      booking.dropoffLocation ||
      booking.to ||
      booking.dest ||
      "-"
    );
  };


  const getVehicle = (booking) => {
    return (
      booking.vehicleType ||
      booking.vehicle ||
      booking.carType ||
      "-"
    );
  };


  const getFare = (booking) => {
    const fare =
      booking.fare ??
      booking.price ??
      booking.amount ??
      booking.totalAmount ??
      0;

    const numericFare = Number(
      String(fare).replace(/[₹,\s]/g, "")
    );

    if (!Number.isFinite(numericFare)) {
      return "₹0";
    }

    return `₹${numericFare.toLocaleString(
      "en-IN"
    )}`;
  };


  const getStatus = (booking) => {
    return (
      booking.status ||
      "Pending"
    );
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard">

        <div
          style={{
            minHeight: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <LoaderCircle
            size={30}
            className="admin-loading-spinner"
            style={{
              animation:
                "adminDashboardSpin 1s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "14px",
            }}
          >
            Loading dashboard data...
          </p>
        </div>

        <style>
          {`
            @keyframes adminDashboardSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>
    );
  }


  /* =====================================================
     MAIN DASHBOARD
  ===================================================== */

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-content-heading">

        <div>

          <span className="admin-eyebrow">
            OVERVIEW
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back. Here's what's happening
            with MANZILL 777.
          </p>

        </div>

        <div className="admin-dashboard-date">

          <span>▣</span>

          {currentDate}

        </div>

      </div>


      {/* =================================================
          FIREBASE ERROR
      ================================================= */}

      {firebaseError && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#fff4f4",
            border: "1px solid #f0cccc",
            color: "#b42318",
            fontSize: "13px",
          }}
        >
          {firebaseError}
        </div>
      )}


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="admin-stat-grid">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div
              className="admin-stat-card"
              key={stat.title}
            >

              <div className="admin-stat-top">

                <div className="admin-stat-icon">
                  <Icon size={19} />
                </div>

                <span
                  className="admin-stat-change"
                  style={{
                    color: "#0a9f5b",
                  }}
                >
                  {stat.change}
                </span>

              </div>


              <div className="admin-stat-value">
                {stat.value}
              </div>


              <div className="admin-stat-title">
                {stat.title}
              </div>

            </div>
          );
        })}

      </div>


      {/* =================================================
          LOWER GRID
      ================================================= */}

      <div className="admin-dashboard-grid">


        {/* ===============================================
            BOOKING OVERVIEW
        =============================================== */}

        <section className="admin-panel admin-chart-panel">

          <div className="admin-panel-header">

            <div>

              <span>
                ANALYTICS
              </span>

              <h2>
                Booking Overview
              </h2>

            </div>


            <select
              value={chartPeriod}
              onChange={(event) =>
                setChartPeriod(
                  event.target.value
                )
              }
            >
              <option value="7">
                Last 7 days
              </option>

              <option value="30">
                Last 30 days
              </option>

              <option value="90">
                Last 90 days
              </option>
            </select>

          </div>


          <div className="admin-chart-placeholder">

            <div className="chart-bars">

              {chartData.map((item) => {

                const height =
                  item.count === 0
                    ? 0
                    : Math.max(
                        (item.count /
                          chartMax) *
                          100,
                        8
                      );

                return (
                  <span
                    key={item.date.toISOString()}
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${item.count} booking${
                      item.count !== 1
                        ? "s"
                        : ""
                    }`}
                  />
                );
              })}

            </div>


            <div className="chart-labels">

              {chartData.map((item) => (
                <span
                  key={item.date.toISOString()}
                >
                  {item.label}
                </span>
              ))}

            </div>

          </div>

        </section>


        {/* ===============================================
            VEHICLES
        =============================================== */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>

              <span>
                FLEET
              </span>

              <h2>
                Vehicles
              </h2>

            </div>

            <Car size={19} />

          </div>


          <div className="admin-vehicle-list">

            {vehicleGroups.length === 0 ? (

              <div
                style={{
                  padding: "30px 0",
                  textAlign: "center",
                  color: "#888",
                  fontSize: "13px",
                }}
              >
                No vehicles found
              </div>

            ) : (

              vehicleGroups.map((vehicle) => (

                <div
                  className="admin-vehicle-item"
                  key={vehicle.name}
                >

                  <div>

                    <strong>
                      {vehicle.name}
                    </strong>

                    <span>
                      {vehicle.total}{" "}
                      {vehicle.total === 1
                        ? "vehicle"
                        : "vehicles"}
                    </span>

                  </div>


                  <b>
                    {vehicle.available > 0
                      ? "Available"
                      : "Unavailable"}
                  </b>

                </div>

              ))

            )}

          </div>

        </section>

      </div>


      {/* =================================================
          RECENT BOOKINGS
      ================================================= */}

      <section className="admin-panel admin-recent-bookings">

        <div className="admin-panel-header">

          <div>

            <span>
              ACTIVITY
            </span>

            <h2>
              Recent Bookings
            </h2>

          </div>


          <button className="admin-view-all">

            View all

            <ArrowUpRight size={15} />

          </button>

        </div>


        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr>

                <th>
                  BOOKING
                </th>

                <th>
                  CUSTOMER
                </th>

                <th>
                  ROUTE
                </th>

                <th>
                  VEHICLE
                </th>

                <th>
                  FARE
                </th>

                <th>
                  STATUS
                </th>

              </tr>

            </thead>


            <tbody>

              {sortedBookings.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "45px 20px",
                      color: "#888",
                    }}
                  >
                    No bookings found.
                  </td>

                </tr>

              ) : (

                sortedBookings
                  .slice(0, 10)
                  .map((booking, index) => {

                    const status =
                      getStatus(
                        booking
                      );

                    const normalizedStatus =
                      String(
                        status
                      ).toLowerCase();

                    let statusClass =
                      "pending";

                    if (
                      normalizedStatus ===
                        "confirmed" ||
                      normalizedStatus ===
                        "accepted"
                    ) {
                      statusClass =
                        "confirmed";
                    }

                    if (
                      normalizedStatus ===
                        "completed" ||
                      normalizedStatus ===
                        "complete"
                    ) {
                      statusClass =
                        "completed";
                    }

                    return (

                      <tr
                        key={
                          booking.id
                        }
                      >

                        <td>
                          #
                          {booking.bookingId ||
                            booking.id
                              .slice(0, 6)
                              .toUpperCase() ||
                            index + 1}
                        </td>


                        <td>

                          <strong>
                            {getCustomerName(
                              booking
                            )}
                          </strong>

                        </td>


                        <td>

                          {getPickup(
                            booking
                          )}

                          {" → "}

                          {getDestination(
                            booking
                          )}

                        </td>


                        <td>

                          {getVehicle(
                            booking
                          )}

                        </td>


                        <td>

                          {getFare(
                            booking
                          )}

                        </td>


                        <td>

                          <span
                            className={`status ${statusClass}`}
                          >
                            {status}
                          </span>

                        </td>

                      </tr>

                    );
                  })

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;