import React, { useEffect, useState } from "react";
import "../styles/Drivers.css";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase";

const AdminDrivers = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);

  const [showAddDriver, setShowAddDriver] = useState(false);

  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");

  const [savingDriver, setSavingDriver] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // =========================================================
  // ADD DRIVER FORM
  // =========================================================

  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  // =========================================================
  // REAL-TIME DRIVERS
  // =========================================================

  useEffect(() => {
    const driversRef = collection(db, "drivers");

    const unsubscribe = onSnapshot(
      driversRef,
      (snapshot) => {
        const driverList = snapshot.docs.map((firebaseDoc) => {
          const data = firebaseDoc.data();

          return {
            firebaseId: firebaseDoc.id,

            id: data.id || "N/A",
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            status: data.status || "Inactive",

            // New relationship
            vehicleId: data.vehicleId || "",

            joined: data.joined || "",
            createdAt: data.createdAt || null,
          };
        });

        driverList.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;

          return bTime - aTime;
        });

        setDrivers(driverList);
        setLoading(false);
        setFirebaseError("");
      },
      (error) => {
        console.error("Firebase drivers listener error:", error);

        setFirebaseError(
          "Unable to load drivers from Firebase. Please check your Firebase configuration and Firestore rules."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================================
  // REAL-TIME VEHICLES
  // =========================================================

  useEffect(() => {
    const vehiclesRef = collection(db, "vehicles");

    const unsubscribe = onSnapshot(
      vehiclesRef,
      (snapshot) => {
        const vehicleList = snapshot.docs.map((firebaseDoc) => {
          const data = firebaseDoc.data();

          return {
            firebaseId: firebaseDoc.id,

            id: data.id || "",
            name: data.name || "",
            number: data.number || "",
            type: data.type || "Sedan",

            driverId: data.driverId || "",
            driver: data.driver || "Unassigned",

            status: data.status || "Available",
            location: data.location || "",

            createdAt: data.createdAt || null,
          };
        });

        setVehicles(vehicleList);
      },
      (error) => {
        console.error("Firebase vehicles listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================================
  // ADD ASSIGNED VEHICLE DATA TO DRIVERS
  // =========================================================

  const getDriverVehicle = (driver) => {
    if (!driver?.vehicleId) return null;

    return (
      vehicles.find(
        (vehicle) =>
          vehicle.firebaseId === driver.vehicleId ||
          vehicle.id === driver.vehicleId
      ) || null
    );
  };

  const driversWithVehicles = drivers.map((driver) => {
    const vehicle = getDriverVehicle(driver);

    return {
      ...driver,

      assignedVehicle: vehicle,

      vehicleName: vehicle?.name || "",
      vehicleNumber: vehicle?.number || "",
    };
  });

  // =========================================================
  // KEEP SELECTED DRIVER UPDATED
  // =========================================================

  useEffect(() => {
    if (!selectedDriver) return;

    const latestDriver = driversWithVehicles.find(
      (driver) => driver.firebaseId === selectedDriver.firebaseId
    );

    if (latestDriver) {
      setSelectedDriver(latestDriver);
    } else {
      setSelectedDriver(null);
    }
  }, [drivers, vehicles]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredDrivers = driversWithVehicles.filter((driver) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      driver.name.toLowerCase().includes(query) ||
      driver.id.toLowerCase().includes(query) ||
      driver.email.toLowerCase().includes(query) ||
      driver.phone.toLowerCase().includes(query) ||
      driver.vehicleName.toLowerCase().includes(query) ||
      driver.vehicleNumber.toLowerCase().includes(query)
    );
  });

  // =========================================================
  // COUNTS
  // =========================================================

  const totalDrivers = drivers.length;

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active"
  ).length;

  const inactiveDrivers = totalDrivers - activeDrivers;

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name) => {
    if (!name) return "DR";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // GENERATE NEXT DRIVER ID
  // =========================================================

  const generateDriverId = () => {
    let highestNumber = 0;

    drivers.forEach((driver) => {
      const match = String(driver.id).match(/^DRV-(\d+)$/);

      if (match) {
        const number = parseInt(match[1], 10);

        if (number > highestNumber) {
          highestNumber = number;
        }
      }
    });

    return `DRV-${String(highestNumber + 1).padStart(3, "0")}`;
  };

  // =========================================================
  // ADD DRIVER
  // =========================================================

  const handleAddDriver = async (e) => {
    e.preventDefault();

    if (savingDriver) return;

    const name = newDriver.name.trim();
    const email = newDriver.email.trim();
    const phone = newDriver.phone.trim();

    if (!name || !email || !phone) {
      alert("Please fill in all driver fields.");
      return;
    }

    try {
      setSavingDriver(true);

      const driverId = generateDriverId();

      const today = new Date();

      const joined = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      await addDoc(collection(db, "drivers"), {
        id: driverId,

        name,
        email,
        phone,

        status: newDriver.status,

        // Driver starts without a vehicle.
        vehicleId: "",

        joined,
        createdAt: serverTimestamp(),
      });

      setNewDriver({
        name: "",
        email: "",
        phone: "",
        status: "Active",
      });

      setShowAddDriver(false);
    } catch (error) {
      console.error("Error adding driver:", error);

      alert("Failed to add driver. Please try again.");
    } finally {
      setSavingDriver(false);
    }
  };

  // =========================================================
  // DELETE DRIVER
  // =========================================================

  const handleDelete = async () => {
    if (!driverToDelete || deletingDriver) return;

    try {
      setDeletingDriver(true);

      const batch = writeBatch(db);

      // -------------------------------------------------------
      // If this driver has a vehicle, unassign it first.
      // -------------------------------------------------------

      const assignedVehicle = getDriverVehicle(driverToDelete);

      if (assignedVehicle) {
        batch.update(doc(db, "vehicles", assignedVehicle.firebaseId), {
          driverId: "",
          driver: "Unassigned",
          updatedAt: serverTimestamp(),
        });
      }

      // -------------------------------------------------------
      // Delete driver
      // -------------------------------------------------------

      batch.delete(doc(db, "drivers", driverToDelete.firebaseId));

      await batch.commit();

      if (
        selectedDriver?.firebaseId ===
        driverToDelete.firebaseId
      ) {
        setSelectedDriver(null);
      }

      setDriverToDelete(null);
    } catch (error) {
      console.error("Error deleting driver:", error);

      alert("Failed to remove driver. Please try again.");
    } finally {
      setDeletingDriver(false);
    }
  };

  // =========================================================
  // TOGGLE DRIVER STATUS
  // =========================================================

  const handleToggleStatus = async (driver) => {
    if (!driver || updatingStatus) return;

    try {
      setUpdatingStatus(true);

      const newStatus =
        driver.status === "Active"
          ? "Inactive"
          : "Active";

      await updateDoc(
        doc(db, "drivers", driver.firebaseId),
        {
          status: newStatus,
        }
      );
    } catch (error) {
      console.error("Error updating driver status:", error);

      alert("Failed to update driver status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // OPEN ADD DRIVER
  // =========================================================

  const openAddDriver = () => {
    setNewDriver({
      name: "",
      email: "",
      phone: "",
      status: "Active",
    });

    setShowAddDriver(true);
  };

  // =========================================================
  // CLOSE ADD DRIVER
  // =========================================================

  const closeAddDriver = () => {
    if (savingDriver) return;

    setShowAddDriver(false);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="driver-content">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="driver-page-header">

        <div>
          <span className="driver-page-label">
            DRIVER MANAGEMENT
          </span>

          <h1>Drivers</h1>

          <p>
            Manage and view all registered drivers.
          </p>
        </div>

        <div className="driver-total">
          <span>Total Drivers</span>
          <strong>{totalDrivers}</strong>
        </div>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "#ecfdf3",
            color: "#087443",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ● {activeDrivers} Active Drivers
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "#f3f4f6",
            color: "#6b7280",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ● {inactiveDrivers} Inactive Drivers
        </div>
      </div>

      {/* =====================================================
          FIREBASE ERROR
      ===================================================== */}

      {firebaseError && (
        <div
          style={{
            padding: "14px 16px",
            marginBottom: "18px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {firebaseError}
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="driver-tools"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
        }}
      >

        <div className="driver-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={openAddDriver}
          style={{
            border: "none",
            background: "#111111",
            color: "#ffffff",
            borderRadius: "9px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + Add Driver
        </button>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="driver-table-card">

        <div className="driver-table-scroll">

          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading drivers...
            </div>
          ) : (
            <table className="driver-table">

              <thead>
                <tr>
                  <th>DRIVER ID</th>
                  <th>DRIVER</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>VEHICLE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {filteredDrivers.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="driver-empty"
                    >
                      <div>
                        <strong>No drivers found</strong>

                        <span>
                          {drivers.length === 0
                            ? "No drivers have been added yet."
                            : "Try searching with a different name or ID."
                          }
                        </span>
                      </div>
                    </td>
                  </tr>

                ) : (

                  filteredDrivers.map((driver) => (

                    <tr
                      key={driver.firebaseId}
                      className="driver-row"
                      onClick={() =>
                        setSelectedDriver(driver)
                      }
                    >

                      <td>
                        <span className="driver-id">
                          {driver.id}
                        </span>
                      </td>

                      <td>
                        <div className="driver-user">

                          <div className="driver-avatar">
                            {getInitials(driver.name)}
                          </div>

                          <div>
                            <strong>
                              {driver.name}
                            </strong>

                            <span>
                              Driver
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="driver-email">
                          {driver.email}
                        </span>
                      </td>

                      <td>
                        <span className="driver-phone">
                          {driver.phone}
                        </span>
                      </td>

                      <td>
                        <div className="driver-vehicle">

                          {driver.assignedVehicle ? (
                            <>
                              <strong>
                                {driver.assignedVehicle.name}
                              </strong>

                              <span>
                                {driver.assignedVehicle.number}
                              </span>
                            </>
                          ) : (
                            <>
                              <strong>
                                Unassigned
                              </strong>

                              <span>
                                No vehicle
                              </span>
                            </>
                          )}

                        </div>
                      </td>

                      <td>
                        <span
                          className={`driver-status ${
                            driver.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <i></i>
                          {driver.status}
                        </span>
                      </td>

                      <td>

                        <div
                          className="driver-actions"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >

                          <button
                            type="button"
                            className="driver-edit-btn"
                            onClick={() =>
                              setSelectedDriver(driver)
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="driver-delete-btn"
                            onClick={() =>
                              setDriverToDelete(driver)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>
          )}

        </div>

        <div className="driver-table-footer">
          Showing <strong>{filteredDrivers.length}</strong>{" "}
          of <strong>{drivers.length}</strong> drivers
        </div>

      </div>

      {/* =====================================================
          DRIVER DETAILS DRAWER
      ===================================================== */}

      {selectedDriver && (

        <>
          <div
            className="driver-drawer-overlay"
            onClick={() =>
              setSelectedDriver(null)
            }
          ></div>

          <aside className="driver-drawer drawer-open">

            <div className="drawer-header">

              <div>
                <span>DRIVER DETAILS</span>

                <h2>Driver Profile</h2>
              </div>

              <button
                type="button"
                className="drawer-close"
                onClick={() =>
                  setSelectedDriver(null)
                }
              >
                ×
              </button>

            </div>

            {/* PROFILE */}

            <div className="drawer-profile">

              <div className="drawer-avatar">
                {getInitials(selectedDriver.name)}
              </div>

              <h3>
                {selectedDriver.name}
              </h3>

              <span className="drawer-driver-id">
                {selectedDriver.id}
              </span>

              <span
                className={`driver-status ${
                  selectedDriver.status === "Active"
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                <i></i>
                {selectedDriver.status}
              </span>

            </div>

            {/* CONTACT */}

            <div className="drawer-section">

              <h4>Contact Information</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Email</span>

                  <strong>
                    {selectedDriver.email}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Phone</span>

                  <strong>
                    {selectedDriver.phone}
                  </strong>
                </div>

              </div>

            </div>

            {/* VEHICLE */}

            <div className="drawer-section">

              <h4>Assigned Vehicle</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Vehicle</span>

                  <strong>
                    {selectedDriver.assignedVehicle?.name ||
                      "Unassigned"}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Vehicle Number</span>

                  <strong>
                    {selectedDriver.assignedVehicle?.number ||
                      "—"}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Vehicle Type</span>

                  <strong>
                    {selectedDriver.assignedVehicle?.type ||
                      "—"}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Vehicle Status</span>

                  <strong>
                    {selectedDriver.assignedVehicle?.status ||
                      "—"}
                  </strong>
                </div>

              </div>

            </div>

            {/* ACCOUNT */}

            <div className="drawer-section">

              <h4>Account Information</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Driver ID</span>

                  <strong>
                    {selectedDriver.id}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Joined</span>

                  <strong>
                    {selectedDriver.joined || "—"}
                  </strong>
                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="drawer-actions">

              <button
                type="button"
                className="drawer-edit-btn"
                disabled={updatingStatus}
                onClick={() =>
                  handleToggleStatus(selectedDriver)
                }
              >
                {updatingStatus
                  ? "Updating..."
                  : selectedDriver.status === "Active"
                  ? "Set Inactive"
                  : "Set Active"}
              </button>

              <button
                type="button"
                className="drawer-delete-btn"
                onClick={() =>
                  setDriverToDelete(selectedDriver)
                }
              >
                Remove Driver
              </button>

            </div>

          </aside>
        </>

      )}

      {/* =====================================================
          ADD DRIVER MODAL
      ===================================================== */}

      {showAddDriver && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={closeAddDriver}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "26px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "22px",
              }}
            >

              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    color: "#7a8ca3",
                  }}
                >
                  DRIVER MANAGEMENT
                </span>

                <h2
                  style={{
                    margin: "5px 0 0",
                    fontSize: "24px",
                    color: "#111827",
                  }}
                >
                  Add Driver
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAddDriver}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddDriver}>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Driver Name
                </label>

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Enter driver name"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Email
                </label>

                <input
                  style={inputStyle}
                  type="email"
                  placeholder="driver@example.com"
                  value={newDriver.email}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Phone
                </label>

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  style={inputStyle}
                  value={newDriver.status}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                This driver will initially have
                <strong style={{ color: "#111827" }}>
                  {" "}no vehicle assigned.
                </strong>

                <br />

                You can assign a vehicle from the
                Vehicles page.
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Driver ID will be automatically
                generated as{" "}

                <strong style={{ color: "#111827" }}>
                  {generateDriverId()}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  onClick={closeAddDriver}
                  disabled={savingDriver}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#374151",
                    padding: "11px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingDriver}
                  style={{
                    border: "none",
                    background: "#111111",
                    color: "#ffffff",
                    padding: "11px 20px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: savingDriver
                      ? "not-allowed"
                      : "pointer",
                    opacity: savingDriver ? 0.6 : 1,
                  }}
                >
                  {savingDriver
                    ? "Adding..."
                    : "Add Driver"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {driverToDelete && (

        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-icon">
              !
            </div>

            <h3>
              Remove Driver?
            </h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>
                {driverToDelete.name}
              </strong>
              ?

              <br />

              {getDriverVehicle(driverToDelete) && (
                <>
                  Their assigned vehicle will become
                  <strong> Unassigned</strong>.
                  <br />
                </>
              )}

              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                type="button"
                className="cancel-delete"
                disabled={deletingDriver}
                onClick={() =>
                  setDriverToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                disabled={deletingDriver}
                onClick={handleDelete}
              >
                {deletingDriver
                  ? "Removing..."
                  : "Remove Driver"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

// =========================================================
// FORM STYLES
// =========================================================

const formGroupStyle = {
  marginBottom: "15px",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "11px 12px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  background: "#ffffff",
};

export default AdminDrivers;