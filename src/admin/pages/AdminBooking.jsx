import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Check,
  X,
  CalendarDays,
  Clock3,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Users,
  IndianRupee,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  CircleAlert,
} from "lucide-react";

import { useMemo, useState } from "react";

import "../styles/adminbooking.css";

function AdminBooking() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookings, setBookings] = useState([
    {
      id: "#BK-1028",
      customer: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul.sharma@example.com",
      pickup: "Phagwara",
      destination: "Delhi",
      vehicle: "Sedan",
      passengers: 2,
      date: "23 Sep 2026",
      time: "10:30 AM",
      fare: 4200,
      baseFare: 4000,
      toll: 200,
      status: "Confirmed",
      bookedAt: "23 Sep 2026, 09:12 AM",
    },

    {
      id: "#BK-1027",
      customer: "Aman Kumar",
      phone: "+91 98765 12345",
      email: "aman.kumar@example.com",
      pickup: "Jalandhar",
      destination: "Chandigarh",
      vehicle: "SUV",
      passengers: 4,
      date: "22 Sep 2026",
      time: "09:00 AM",
      fare: 2800,
      baseFare: 2600,
      toll: 200,
      status: "Pending",
      bookedAt: "22 Sep 2026, 08:15 AM",
    },

    {
      id: "#BK-1026",
      customer: "Simran Kaur",
      phone: "+91 99887 66554",
      email: "simran.kaur@example.com",
      pickup: "Ludhiana",
      destination: "Amritsar",
      vehicle: "Premium",
      passengers: 3,
      date: "21 Sep 2026",
      time: "02:15 PM",
      fare: 3600,
      baseFare: 3400,
      toll: 200,
      status: "Completed",
      bookedAt: "21 Sep 2026, 01:30 PM",
    },

    {
      id: "#BK-1025",
      customer: "Vikram Singh",
      phone: "+91 98765 11223",
      email: "vikram.singh@example.com",
      pickup: "Phagwara",
      destination: "Ludhiana",
      vehicle: "Sedan",
      passengers: 2,
      date: "20 Sep 2026",
      time: "08:45 AM",
      fare: 1950,
      baseFare: 1800,
      toll: 150,
      status: "Confirmed",
      bookedAt: "20 Sep 2026, 07:20 AM",
    },

    {
      id: "#BK-1024",
      customer: "Neha Gupta",
      phone: "+91 98765 94321",
      email: "neha.gupta@example.com",
      pickup: "Delhi",
      destination: "Phagwara",
      vehicle: "SUV",
      passengers: 5,
      date: "19 Sep 2026",
      time: "11:30 AM",
      fare: 4800,
      baseFare: 4500,
      toll: 300,
      status: "Cancelled",
      bookedAt: "19 Sep 2026, 10:10 AM",
    },

    {
      id: "#BK-1023",
      customer: "Karan Malhotra",
      phone: "+91 98765 77890",
      email: "karan.m@example.com",
      pickup: "Chandigarh",
      destination: "Manali",
      vehicle: "Premium",
      passengers: 4,
      date: "18 Sep 2026",
      time: "07:15 AM",
      fare: 6200,
      baseFare: 5800,
      toll: 400,
      status: "Completed",
      bookedAt: "18 Sep 2026, 06:40 AM",
    },

    {
      id: "#BK-1022",
      customer: "Pooja Verma",
      phone: "+91 98765 66778",
      email: "pooja.verma@example.com",
      pickup: "Amritsar",
      destination: "Delhi",
      vehicle: "Sedan",
      passengers: 2,
      date: "17 Sep 2026",
      time: "12:00 PM",
      fare: 3900,
      baseFare: 3600,
      toll: 300,
      status: "Pending",
      bookedAt: "17 Sep 2026, 10:30 AM",
    },

    {
      id: "#BK-1021",
      customer: "Arjun Mehta",
      phone: "+91 98765 55667",
      email: "arjun.mehta@example.com",
      pickup: "Ludhiana",
      destination: "Shimla",
      vehicle: "SUV",
      passengers: 4,
      date: "16 Sep 2026",
      time: "06:30 AM",
      fare: 5400,
      baseFare: 5000,
      toll: 400,
      status: "Confirmed",
      bookedAt: "16 Sep 2026, 05:50 AM",
    },
  ]);

  // =========================
  // COUNTS
  // =========================

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  };

  // =========================
  // FILTER
  // =========================

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (activeTab !== "All Bookings") {
      result = result.filter(
        (booking) => booking.status === activeTab
      );
    }

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((booking) =>
        [
          booking.id,
          booking.customer,
          booking.phone,
          booking.pickup,
          booking.destination,
          booking.vehicle,
        ]
          .join(" ")
          .toLowerCase()
          .includes(value)
      );
    }

    return result;
  }, [bookings, activeTab, search]);

  // =========================
  // ACCEPT
  // =========================

  const handleAccept = (id) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: "Confirmed" }
          : booking
      )
    );

    setSelectedBooking((prev) =>
      prev?.id === id
        ? { ...prev, status: "Confirmed" }
        : prev
    );
  };

  // =========================
  // DECLINE
  // =========================

  const handleDecline = (id) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: "Cancelled" }
          : booking
      )
    );

    setSelectedBooking((prev) =>
      prev?.id === id
        ? { ...prev, status: "Cancelled" }
        : prev
    );
  };

  // =========================
  // STATUS ICON
  // =========================

  const StatusIcon = ({ status }) => {
    if (status === "Confirmed") {
      return <CircleCheck size={14} />;
    }

    if (status === "Cancelled") {
      return <CircleX size={14} />;
    }

    if (status === "Pending") {
      return <CircleAlert size={14} />;
    }

    return <CircleCheck size={14} />;
  };

  return (
    <div className="admin-bookings-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="booking-page-header">

        <div>
          <span className="booking-eyebrow">
            MANAGEMENT
          </span>

          <h1>Bookings</h1>

          <p>
            View and manage all customer ride bookings.
          </p>
        </div>

        <div className="booking-header-date">
          <CalendarDays size={15} />
          Tuesday, 23 September 2026
        </div>

      </div>


      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="booking-stats-grid">

        <div className="booking-stat-card">

          <div className="booking-stat-icon">
            <CalendarDays size={18} />
          </div>

          <div className="booking-stat-content">

            <strong>{counts.all}</strong>

            <span>Total Bookings</span>

          </div>

          <div className="booking-stat-growth positive">
            <ArrowUp size={12} />
            12.5%
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="booking-stat-icon">
            <CircleCheck size={18} />
          </div>

          <div className="booking-stat-content">

            <strong>{counts.confirmed}</strong>

            <span>Confirmed</span>

          </div>

          <div className="booking-stat-growth positive">
            <ArrowUp size={12} />
            8.2%
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="booking-stat-icon">
            <Clock3 size={18} />
          </div>

          <div className="booking-stat-content">

            <strong>{counts.pending}</strong>

            <span>Pending</span>

          </div>

          <div className="booking-stat-growth warning">
            <ArrowDown size={12} />
            4.1%
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="booking-stat-icon">
            <X size={18} />
          </div>

          <div className="booking-stat-content">

            <strong>{counts.cancelled}</strong>

            <span>Cancelled</span>

          </div>

          <div className="booking-stat-growth danger">
            <ArrowUp size={12} />
            1.1%
          </div>

        </div>

      </div>


      {/* ======================================
          BOOKING TABLE PANEL
      ====================================== */}

      <section className="booking-table-panel">

        {/* TABS */}

        <div className="booking-tabs">

          {[
            ["All Bookings", counts.all],
            ["Pending", counts.pending],
            ["Confirmed", counts.confirmed],
            ["Completed", counts.completed],
            ["Cancelled", counts.cancelled],
          ].map(([tab, count]) => (

            <button
              key={tab}
              className={
                activeTab === tab
                  ? "booking-tab active"
                  : "booking-tab"
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}

              <span>{count}</span>
            </button>

          ))}

        </div>


        {/* FILTER BAR */}

        <div className="booking-toolbar">

          <div className="booking-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search by name, booking ID, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>


          <button className="booking-filter-button">
            <SlidersHorizontal size={15} />
            Filter
          </button>

        </div>


        {/* TABLE */}

        <div className="booking-table-wrapper">

          <table className="booking-table">

            <thead>

              <tr>

                <th className="booking-check-column">
                  <input type="checkbox" />
                </th>

                <th>BOOKING ID</th>

                <th>CUSTOMER</th>

                <th>ROUTE</th>

                <th>VEHICLE</th>

                <th>DATE & TIME</th>

                <th>FARE</th>

                <th>STATUS</th>

                <th>ACTIONS</th>

              </tr>

            </thead>


            <tbody>

              {filteredBookings.map((booking) => (

                <tr
                  key={booking.id}
                  className={
                    selectedBooking?.id === booking.id
                      ? "booking-row-selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedBooking(booking)
                  }
                >

                  <td
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" />
                  </td>


                  <td>

                    <button
                      className="booking-id"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                    >
                      {booking.id}
                    </button>

                  </td>


                  <td>

                    <div className="booking-customer">

                      <strong>
                        {booking.customer}
                      </strong>

                      <span>
                        {booking.phone}
                      </span>

                    </div>

                  </td>


                  <td>

                    <div className="booking-route">

                      <span>
                        {booking.pickup}
                      </span>

                      <span className="route-arrow">
                        →
                      </span>

                      <span>
                        {booking.destination}
                      </span>

                    </div>

                  </td>


                  <td>

                    <div className="booking-vehicle">

                      <strong>
                        {booking.vehicle}
                      </strong>

                      <span>
                        {booking.passengers} passengers
                      </span>

                    </div>

                  </td>


                  <td>

                    <div className="booking-datetime">

                      <strong>
                        {booking.date}
                      </strong>

                      <span>
                        {booking.time}
                      </span>

                    </div>

                  </td>


                  <td>

                    <strong className="booking-fare">
                      ₹{booking.fare.toLocaleString("en-IN")}
                    </strong>

                  </td>


                  <td>

                    <span
                      className={`booking-status ${booking.status.toLowerCase()}`}
                    >
                      <StatusIcon status={booking.status} />

                      {booking.status}
                    </span>

                  </td>


                  <td
                    onClick={(e) => e.stopPropagation()}
                  >

                    <div className="booking-actions">

                      {booking.status === "Pending" && (

                        <>
                          <button
                            className="booking-action accept"
                            title="Accept booking"
                            onClick={() =>
                              handleAccept(booking.id)
                            }
                          >
                            <Check size={15} />
                          </button>

                          <button
                            className="booking-action decline"
                            title="Decline booking"
                            onClick={() =>
                              handleDecline(booking.id)
                            }
                          >
                            <X size={15} />
                          </button>
                        </>

                      )}

                      <button
                        className="booking-more"
                        onClick={() =>
                          setSelectedBooking(booking)
                        }
                      >
                        <MoreHorizontal size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {filteredBookings.length === 0 && (

            <div className="booking-empty">
              <CalendarDays size={30} />

              <strong>
                No bookings found
              </strong>

              <span>
                Try changing your search or filter.
              </span>
            </div>

          )}

        </div>


        {/* FOOTER */}

        <div className="booking-table-footer">

          <span>
            Showing {filteredBookings.length} of{" "}
            {bookings.length} bookings
          </span>

          <div className="booking-pagination">

            <button>
              <ChevronLeft size={15} />
            </button>

            <button className="active">
              1
            </button>

            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>

            <span>...</span>

            <button>31</button>

            <button>
              <ChevronRight size={15} />
            </button>

          </div>

        </div>

      </section>


      {/* ======================================
          RIGHT BOOKING DETAILS DRAWER
      ====================================== */}

      {selectedBooking && (

        <>

          <div
            className="booking-drawer-overlay"
            onClick={() => setSelectedBooking(null)}
          />


          <aside className="booking-details-drawer">

            {/* DRAWER HEADER */}

            <div className="booking-drawer-header">

              <div>

                <span>
                  BOOKING DETAILS
                </span>

                <h2>
                  {selectedBooking.id}
                </h2>

              </div>

              <button
                className="booking-drawer-close"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                <X size={19} />
              </button>

            </div>


            {/* STATUS */}

            <div className="booking-drawer-status">

              <span
                className={`booking-status ${selectedBooking.status.toLowerCase()}`}
              >
                <StatusIcon
                  status={selectedBooking.status}
                />

                {selectedBooking.status}
              </span>

              <span>
                Booked on {selectedBooking.bookedAt}
              </span>

            </div>


            {/* CUSTOMER */}

            <div className="booking-detail-section">

              <div className="booking-detail-title">
                <User size={16} />
                Customer Information
              </div>


              <div className="booking-detail-list">

                <div>

                  <User size={15} />

                  <span>
                    {selectedBooking.customer}
                  </span>

                </div>


                <div>

                  <Phone size={15} />

                  <span>
                    {selectedBooking.phone}
                  </span>

                </div>


                <div>

                  <Mail size={15} />

                  <span>
                    {selectedBooking.email}
                  </span>

                </div>

              </div>

            </div>


            {/* TRIP */}

            <div className="booking-detail-section">

              <div className="booking-detail-title">
                <MapPin size={16} />
                Trip Details
              </div>


              <div className="booking-trip">

                <div className="trip-location">

                  <span className="trip-dot pickup" />

                  <div>
                    <small>Pickup</small>
                    <strong>
                      {selectedBooking.pickup}
                    </strong>
                  </div>

                </div>


                <div className="trip-line" />


                <div className="trip-location">

                  <span className="trip-dot destination" />

                  <div>
                    <small>Destination</small>
                    <strong>
                      {selectedBooking.destination}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="booking-trip-meta">

                <div>

                  <CalendarDays size={15} />

                  <span>
                    {selectedBooking.date}
                  </span>

                </div>


                <div>

                  <Clock3 size={15} />

                  <span>
                    {selectedBooking.time}
                  </span>

                </div>


                <div>

                  <Car size={15} />

                  <span>
                    {selectedBooking.vehicle}
                  </span>

                </div>


                <div>

                  <Users size={15} />

                  <span>
                    {selectedBooking.passengers} passengers
                  </span>

                </div>

              </div>

            </div>


            {/* FARE */}

            <div className="booking-detail-section">

              <div className="booking-detail-title">
                <IndianRupee size={16} />
                Fare Details
              </div>


              <div className="fare-details">

                <div>
                  <span>Base Fare</span>
                  <strong>
                    ₹
                    {selectedBooking.baseFare.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>


                <div>
                  <span>Toll Charges</span>
                  <strong>
                    ₹
                    {selectedBooking.toll.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>


                <div className="fare-total">

                  <span>Total Fare</span>

                  <strong>
                    ₹
                    {selectedBooking.fare.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* STATUS */}

            <div className="booking-detail-section">

              <div className="booking-detail-title">
                <CircleCheck size={16} />
                Status
              </div>


              <span
                className={`booking-status ${selectedBooking.status.toLowerCase()}`}
              >
                <StatusIcon
                  status={selectedBooking.status}
                />

                {selectedBooking.status}
              </span>

            </div>


            {/* ACTIONS */}

            <div className="booking-drawer-actions">

              <span>Actions</span>


              {selectedBooking.status === "Pending" && (

                <>

                  <button
                    className="drawer-accept"
                    onClick={() =>
                      handleAccept(selectedBooking.id)
                    }
                  >
                    <Check size={16} />
                    Accept Booking
                  </button>


                  <button
                    className="drawer-decline"
                    onClick={() =>
                      handleDecline(selectedBooking.id)
                    }
                  >
                    <X size={16} />
                    Decline Booking
                  </button>

                </>

              )}


              {selectedBooking.status === "Confirmed" && (

                <button
                  className="drawer-complete"
                  onClick={() => {

                    setBookings((prev) =>
                      prev.map((booking) =>
                        booking.id === selectedBooking.id
                          ? {
                              ...booking,
                              status: "Completed",
                            }
                          : booking
                      )
                    );

                    setSelectedBooking({
                      ...selectedBooking,
                      status: "Completed",
                    });

                  }}
                >
                  <Check size={16} />
                  Mark as Completed
                </button>

              )}


              {selectedBooking.status !== "Cancelled" && (
                <button
                  className="drawer-edit"
                >
                  Edit Booking
                </button>
              )}

            </div>

          </aside>

        </>

      )}

    </div>
  );
}

export default AdminBooking;