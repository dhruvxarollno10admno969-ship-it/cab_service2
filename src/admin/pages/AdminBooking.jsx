
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
  CircleCheck,
  CircleX,
  CircleAlert,
  MessageCircle,
  Route,
} from "lucide-react";

import { useMemo, useState, useEffect } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/adminbooking.css";

// =====================================================
// HELPERS
// =====================================================

const formatDateValue = (value) => {
  if (!value) return "—";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString("en-IN");
  }

  if (value instanceof Date) {
    return value.toLocaleString("en-IN");
  }

  return String(value);
};

const getTime = (value) => {
  if (!value) return 0;

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value === "number") {
    return value;
  }

  return 0;
};

// =====================================================
// COMPONENT
// =====================================================

function AdminBooking() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // LOAD BOOKINGS FROM FIREBASE
  // =====================================================

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const bookingData = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            ...data,
            id: document.id,

            customer:
              data.customer ||
              data.name ||
              "Unknown Customer",

            // Keep the actual saved customer phone number.
            phone: data.phone || "",

            email: data.email || "",

            pickup:
              data.pickup ||
              data.pickupLocation ||
              "—",

            destination:
              data.destination ||
              data.dropoff ||
              data.destinationLocation ||
              "—",

            vehicle:
              data.vehicle ||
              data.vehicleType ||
              "Not selected",

            passengers: Number(data.passengers) || 1,

            date:
              data.date ||
              data.bookingDate ||
              "—",

            time:
              data.time ||
              data.bookingTime ||
              "—",

            // One Way / Road Trip
            tripType: data.tripType || "One Way",

            returnPickup:
              data.returnPickup ||
              data.pickup ||
              "",

            returnTime: data.returnTime || "",

            oneWayDistance: Number(data.oneWayDistance) || 0,
            returnDistance: Number(data.returnDistance) || 0,
            totalDistance:
              Number(data.totalDistance) ||
              Number(data.distance) ||
              0,

            fare: Number(
              data.fare ?? data.totalFare ?? 0
            ),

            baseFare: Number(data.baseFare ?? 0),

            toll: Number(
              data.toll ?? data.tollCharges ?? 0
            ),

            status: data.status || "Pending",

            bookedAt: data.bookedAt || null,
            createdAt: data.createdAt || null,
          };
        });

        bookingData.sort(
          (a, b) => getTime(b.createdAt) - getTime(a.createdAt)
        );

        setBookings(bookingData);

        // Keep the open details drawer synchronized with Firebase.
        setSelectedBooking((previous) => {
          if (!previous) return null;

          return (
            bookingData.find(
              (booking) => booking.id === previous.id
            ) || null
          );
        });

        setLoading(false);

        console.log("Firebase bookings:", bookingData);
      },
      (firebaseError) => {
        console.error("Bookings Firestore error:", firebaseError);

        setError("Unable to load bookings from Firebase.");

        toast.error("Unable to load bookings from Firebase.");

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // BOOKING COUNTS
  // =====================================================

  const counts = useMemo(
    () => ({
      all: bookings.length,

      pending: bookings.filter(
        (booking) => booking.status === "Pending"
      ).length,

      confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed"
      ).length,

      completed: bookings.filter(
        (booking) => booking.status === "Completed"
      ).length,

      cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled"
      ).length,
    }),
    [bookings]
  );

  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (activeTab !== "All Bookings") {
      result = result.filter(
        (booking) => booking.status === activeTab
      );
    }

    if (search.trim()) {
      const value = search.toLowerCase().trim();

      result = result.filter((booking) =>
        [
          booking.id,
          booking.customer,
          booking.phone,
          booking.email,
          booking.pickup,
          booking.destination,
          booking.vehicle,
          booking.tripType,
          booking.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(value)
      );
    }

    return result;
  }, [bookings, activeTab, search]);

  // =====================================================
  // UPDATE BOOKING STATUS
  // =====================================================

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      setError("");

      const bookingRef = doc(db, "bookings", bookingId);

      await updateDoc(bookingRef, {
        status: newStatus,
      });

      console.log(`Booking ${bookingId} → ${newStatus}`);

      if (newStatus === "Confirmed") {
        toast.success("Ride confirmed successfully!");
      } else if (newStatus === "Cancelled") {
        toast.success("Booking cancelled successfully.");
      } else if (newStatus === "Completed") {
        toast.success("Ride marked as completed!");
      }

      return true;
    } catch (firebaseError) {
      console.error("Failed to update booking:", firebaseError);

      setError(
        "Unable to update booking. Check your Firebase permissions."
      );

      toast.error(
        "Unable to update booking. Check Firebase permissions."
      );

      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // ACCEPT BOOKING
  // =====================================================

  const handleAccept = async (id) => {
    const success = await updateBookingStatus(id, "Confirmed");

    if (!success) return;

    setSelectedBooking((previous) =>
      previous?.id === id
        ? { ...previous, status: "Confirmed" }
        : previous
    );
  };

  // =====================================================
  // DECLINE BOOKING
  // =====================================================

  const handleDecline = async (id) => {
    const success = await updateBookingStatus(id, "Cancelled");

    if (!success) return;

    setSelectedBooking((previous) =>
      previous?.id === id
        ? { ...previous, status: "Cancelled" }
        : previous
    );
  };

  // =====================================================
  // COMPLETE BOOKING
  // =====================================================

  const handleComplete = async (id) => {
    const success = await updateBookingStatus(id, "Completed");

    if (!success) return;

    setSelectedBooking((previous) =>
      previous?.id === id
        ? { ...previous, status: "Completed" }
        : previous
    );
  };

  // =====================================================
  // MANUAL WHATSAPP CONFIRMATION
  // =====================================================

  const handleWhatsAppConfirmation = (booking) => {
    if (booking.status !== "Confirmed") {
      toast.warning("Only confirmed bookings can receive a confirmation message.");
      return;
    }

    // IMPORTANT:
    // The recipient is the CUSTOMER'S saved profile number.
    // Never hardcode the admin's number here.

    let phoneNumber = String(booking.phone || "").replace(/\D/g, "");

    // Convert 10-digit Indian number to international format.
    if (/^[6-9]\d{9}$/.test(phoneNumber)) {
      phoneNumber = `91${phoneNumber}`;
    }

    // Accept a number saved with 0 before the 10 digits.
    if (/^0[6-9]\d{9}$/.test(phoneNumber)) {
      phoneNumber = `91${phoneNumber.slice(1)}`;
    }

    // Validate Indian mobile number.
    if (!/^91[6-9]\d{9}$/.test(phoneNumber)) {
      toast.error(
        "Customer phone number is missing or invalid. Check the customer's profile."
      );
      return;
    }

    const isRoadTrip =
      String(booking.tripType).toLowerCase().includes("road");

    const message = [
      `Hello ${booking.customer}! 👋`,
      "",
      "Your MANZILL 777 ride is confirmed! 🚗",
      "",
      `Booking ID: ${booking.id}`,
      `Trip Type: ${booking.tripType}`,
      `Pickup: ${booking.pickup}`,
      `Destination: ${booking.destination}`,
      ...(isRoadTrip
        ? [
            `Return to: ${booking.returnPickup || booking.pickup}`,
            `Return Time: ${booking.returnTime || "As discussed"}`,
          ]
        : []),
      `Date: ${booking.date}`,
      `Pickup Time: ${booking.time}`,
      `Vehicle: ${booking.vehicle}`,
      `Passengers: ${booking.passengers}`,
      ...(booking.totalDistance
        ? [`Total Distance: ${booking.totalDistance} km`]
        : []),
      `Total Fare: ₹${Number(booking.fare || 0).toLocaleString("en-IN")}`,
      "",
      "Thank you for choosing MANZILL 777.",
      "Have a safe journey! ❤️",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Opens WhatsApp with a prefilled message.
    // Admin must press Send manually.
    const whatsappWindow = window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!whatsappWindow) {
      toast.warning(
        "WhatsApp could not open. Please allow pop-ups in your browser."
      );
      return;
    }

    toast.success("WhatsApp confirmation message is ready!");
  };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const StatusIcon = ({ status }) => {
    if (status === "Confirmed" || status === "Completed") {
      return <CircleCheck size={14} />;
    }

    if (status === "Cancelled") {
      return <CircleX size={14} />;
    }

    return <CircleAlert size={14} />;
  };

  // =====================================================
  // CURRENT DATE
  // =====================================================

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-bookings-page">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          newestOnTop
        />

        <div className="booking-page-header">
          <div>
            <span className="booking-eyebrow">MANAGEMENT</span>
            <h1>Bookings</h1>
            <p>Loading real-time bookings...</p>
          </div>
        </div>

        <div className="booking-empty">
          <CalendarDays size={30} />
          <strong>Loading bookings...</strong>
          <span>Connecting to Firebase.</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-bookings-page">

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* HEADER */}

      <div className="booking-page-header">
        <div>
          <span className="booking-eyebrow">MANAGEMENT</span>
          <h1>Bookings</h1>
          <p>
            View and manage all customer ride bookings in real time.
          </p>
        </div>

        <div className="booking-header-date">
          <CalendarDays size={15} />
          {currentDate}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#fff5f5",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="booking-stats-grid">

        <div className="booking-stat-card">
          <div className="booking-stat-icon">
            <CalendarDays size={18} />
          </div>
          <div className="booking-stat-content">
            <strong>{counts.all}</strong>
            <span>Total Bookings</span>
          </div>
          <div className="booking-stat-growth positive">LIVE</div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon">
            <CircleCheck size={18} />
          </div>
          <div className="booking-stat-content">
            <strong>{counts.confirmed}</strong>
            <span>Confirmed</span>
          </div>
          <div className="booking-stat-growth positive">LIVE</div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon">
            <Clock3 size={18} />
          </div>
          <div className="booking-stat-content">
            <strong>{counts.pending}</strong>
            <span>Pending</span>
          </div>
          <div className="booking-stat-growth warning">LIVE</div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon">
            <X size={18} />
          </div>
          <div className="booking-stat-content">
            <strong>{counts.cancelled}</strong>
            <span>Cancelled</span>
          </div>
          <div className="booking-stat-growth danger">LIVE</div>
        </div>

      </div>

      {/* BOOKING TABLE */}

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

        {/* TOOLBAR */}

        <div className="booking-toolbar">
          <div className="booking-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, booking ID, route..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
              {filteredBookings.map((booking) => {
                const isUpdating = updatingId === booking.id;

                return (
                  <tr
                    key={booking.id}
                    className={
                      selectedBooking?.id === booking.id
                        ? "booking-row-selected"
                        : ""
                    }
                    onClick={() => setSelectedBooking(booking)}
                  >

                    <td onClick={(event) => event.stopPropagation()}>
                      <input type="checkbox" />
                    </td>

                    <td>
                      <button
                        className="booking-id"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        {booking.id}
                      </button>
                    </td>

                    <td>
                      <div className="booking-customer">
                        <strong>{booking.customer}</strong>
                        <span>{booking.phone || "Phone not provided"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="booking-route">
                        <span>{booking.pickup}</span>
                        <span className="route-arrow">→</span>
                        <span>{booking.destination}</span>
                      </div>
                      <small>{booking.tripType}</small>
                    </td>

                    <td>
                      <div className="booking-vehicle">
                        <strong>{booking.vehicle}</strong>
                        <span>{booking.passengers} passengers</span>
                      </div>
                    </td>

                    <td>
                      <div className="booking-datetime">
                        <strong>{booking.date}</strong>
                        <span>{booking.time}</span>
                      </div>
                    </td>

                    <td>
                      <strong className="booking-fare">
                        ₹{Number(booking.fare || 0).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`booking-status ${String(
                          booking.status
                        ).toLowerCase()}`}
                      >
                        <StatusIcon status={booking.status} />
                        {booking.status}
                      </span>
                    </td>

                    <td onClick={(event) => event.stopPropagation()}>
                      <div className="booking-actions">

                        {booking.status === "Pending" && (
                          <>
                            <button
                              className="booking-action accept"
                              title="Accept booking"
                              disabled={isUpdating}
                              onClick={() => handleAccept(booking.id)}
                            >
                              {isUpdating ? (
                                <span>...</span>
                              ) : (
                                <Check size={15} />
                              )}
                            </button>

                            <button
                              className="booking-action decline"
                              title="Decline booking"
                              disabled={isUpdating}
                              onClick={() => handleDecline(booking.id)}
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}

                        {booking.status === "Confirmed" && (
                          <button
                            className="booking-action whatsapp"
                            title="Send WhatsApp confirmation"
                            onClick={() =>
                              handleWhatsAppConfirmation(booking)
                            }
                          >
                            <MessageCircle size={16} />
                          </button>
                        )}

                        <button
                          className="booking-more"
                          disabled={isUpdating}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="booking-empty">
              <CalendarDays size={30} />
              <strong>No bookings found</strong>
              <span>
                There are currently no bookings matching your search.
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="booking-table-footer">
          <span>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>
        </div>

      </section>

      {/* BOOKING DETAILS DRAWER */}

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
                <span>BOOKING DETAILS</span>
                <h2>{selectedBooking.id}</h2>
              </div>

              <button
                className="booking-drawer-close"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={19} />
              </button>
            </div>

            {/* STATUS */}

            <div className="booking-drawer-status">
              <span
                className={`booking-status ${String(
                  selectedBooking.status
                ).toLowerCase()}`}
              >
                <StatusIcon status={selectedBooking.status} />
                {selectedBooking.status}
              </span>

              <span>
                Booked on {formatDateValue(selectedBooking.bookedAt)}
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
                  <span>{selectedBooking.customer}</span>
                </div>

                <div>
                  <Phone size={15} />
                  <span>{selectedBooking.phone || "Not provided"}</span>
                </div>

                <div>
                  <Mail size={15} />
                  <span>{selectedBooking.email || "Not provided"}</span>
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
                    <strong>{selectedBooking.pickup}</strong>
                  </div>
                </div>

                <div className="trip-line" />

                <div className="trip-location">
                  <span className="trip-dot destination" />
                  <div>
                    <small>Destination</small>
                    <strong>{selectedBooking.destination}</strong>
                  </div>
                </div>

                {String(selectedBooking.tripType)
                  .toLowerCase()
                  .includes("road") && (
                  <>
                    <div className="trip-line" />

                    <div className="trip-location">
                      <span className="trip-dot pickup" />
                      <div>
                        <small>Return to</small>
                        <strong>
                          {selectedBooking.returnPickup ||
                            selectedBooking.pickup}
                        </strong>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="booking-trip-meta">
                <div>
                  <Route size={15} />
                  <span>{selectedBooking.tripType}</span>
                </div>

                <div>
                  <CalendarDays size={15} />
                  <span>{selectedBooking.date}</span>
                </div>

                <div>
                  <Clock3 size={15} />
                  <span>Pickup: {selectedBooking.time}</span>
                </div>

                {String(selectedBooking.tripType)
                  .toLowerCase()
                  .includes("road") && (
                  <div>
                    <Clock3 size={15} />
                    <span>
                      Return: {selectedBooking.returnTime || "—"}
                    </span>
                  </div>
                )}

                <div>
                  <Car size={15} />
                  <span>{selectedBooking.vehicle}</span>
                </div>

                <div>
                  <Users size={15} />
                  <span>{selectedBooking.passengers} passengers</span>
                </div>

                {selectedBooking.totalDistance > 0 && (
                  <div>
                    <Route size={15} />
                    <span>
                      {selectedBooking.totalDistance} km total
                    </span>
                  </div>
                )}
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
                    ₹{Number(
                      selectedBooking.baseFare || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Toll Charges</span>
                  <strong>
                    ₹{Number(
                      selectedBooking.toll || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="fare-total">
                  <span>Total Fare</span>
                  <strong>
                    ₹{Number(
                      selectedBooking.fare || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* CURRENT STATUS */}

            <div className="booking-detail-section">
              <div className="booking-detail-title">
                <CircleCheck size={16} />
                Status
              </div>

              <span
                className={`booking-status ${String(
                  selectedBooking.status
                ).toLowerCase()}`}
              >
                <StatusIcon status={selectedBooking.status} />
                {selectedBooking.status}
              </span>
            </div>

            {/* DRAWER ACTIONS */}

            <div className="booking-drawer-actions">
              <span>Actions</span>

              {selectedBooking.status === "Pending" && (
                <>
                  <button
                    className="drawer-accept"
                    disabled={updatingId === selectedBooking.id}
                    onClick={() => handleAccept(selectedBooking.id)}
                  >
                    <Check size={16} />
                    {updatingId === selectedBooking.id
                      ? "Updating..."
                      : "Accept Booking"}
                  </button>

                  <button
                    className="drawer-decline"
                    disabled={updatingId === selectedBooking.id}
                    onClick={() => handleDecline(selectedBooking.id)}
                  >
                    <X size={16} />
                    Decline Booking
                  </button>
                </>
              )}

              {selectedBooking.status === "Confirmed" && (
                <>
                  <button
                    className="drawer-whatsapp"
                    onClick={() =>
                      handleWhatsAppConfirmation(selectedBooking)
                    }
                  >
                    <MessageCircle size={17} />
                    Send WhatsApp Confirmation
                  </button>

                  <button
                    className="drawer-complete"
                    disabled={updatingId === selectedBooking.id}
                    onClick={() => handleComplete(selectedBooking.id)}
                  >
                    <Check size={16} />
                    {updatingId === selectedBooking.id
                      ? "Updating..."
                      : "Mark as Completed"}
                  </button>
                </>
              )}
            </div>

          </aside>
        </>
      )}
    </div>
  );
}

export default AdminBooking;
