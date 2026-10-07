import { useEffect, useState } from "react";

import {
  Search,
  Car,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  Wrench,
  MapPin,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase";

import "../styles/vehicles.css";

function AdminVehicles() {

  // =========================================================
  // STATE
  // =========================================================

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // VEHICLE FORM
  // =========================================================

  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    number: "",
    type: "Sedan",
    driverId: "",
    driver: "",
    status: "Available",
    location: "",
  });

  // =========================================================
  // REAL-TIME VEHICLES
  // =========================================================

  useEffect(() => {

    const vehiclesRef = collection(db, "vehicles");

    const unsubscribe = onSnapshot(
      vehiclesRef,

      (snapshot) => {

        const vehicleList = snapshot.docs.map(
          (firebaseDoc) => {

            const data = firebaseDoc.data();

            return {
              firebaseId: firebaseDoc.id,

              id: data.id || "",

              name: data.name || "",

              number: data.number || "",

              type: data.type || "Sedan",

              driver: data.driver || "Unassigned",

              driverId: data.driverId || "",

              status: data.status || "Available",

              location: data.location || "",

              createdAt: data.createdAt || null,

              updatedAt: data.updatedAt || null,
            };
          }
        );

        vehicleList.sort((a, b) => {

          const aTime =
            a.createdAt?.seconds || 0;

          const bTime =
            b.createdAt?.seconds || 0;

          return bTime - aTime;
        });

        setVehicles(vehicleList);

        setLoading(false);
        setError("");
      },

      (firebaseError) => {

        console.error(
          "Vehicle Firebase error:",
          firebaseError
        );

        setError(
          "Unable to load vehicles from Firebase."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, []);

  // =========================================================
  // REAL-TIME DRIVERS
  // =========================================================

  useEffect(() => {

    const driversRef = collection(db, "drivers");

    const unsubscribe = onSnapshot(
      driversRef,

      (snapshot) => {

        const driverList = snapshot.docs.map(
          (firebaseDoc) => {

            const data = firebaseDoc.data();

            return {
              firebaseId: firebaseDoc.id,

              id: data.id || "",

              name: data.name || "",

              email: data.email || "",

              phone: data.phone || "",

              vehicleId: data.vehicleId || "",

              status: data.status || "Inactive",
            };
          }
        );

        setDrivers(driverList);
      },

      (firebaseError) => {

        console.error(
          "Driver Firebase error:",
          firebaseError
        );
      }
    );

    return () => unsubscribe();

  }, []);

  // =========================================================
  // KEEP SELECTED VEHICLE UPDATED
  // =========================================================

  useEffect(() => {

    if (!selectedVehicle) return;

    const latestVehicle = vehicles.find(
      (vehicle) =>
        vehicle.firebaseId ===
        selectedVehicle.firebaseId
    );

    if (latestVehicle) {

      setSelectedVehicle(latestVehicle);

    } else {

      setSelectedVehicle(null);

    }

  }, [vehicles]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredVehicles = vehicles.filter(
    (vehicle) => {

      const value =
        search.toLowerCase().trim();

      if (!value) return true;

      return (

        vehicle.id
          .toLowerCase()
          .includes(value) ||

        vehicle.name
          .toLowerCase()
          .includes(value) ||

        vehicle.number
          .toLowerCase()
          .includes(value) ||

        vehicle.driver
          .toLowerCase()
          .includes(value) ||

        vehicle.type
          .toLowerCase()
          .includes(value) ||

        vehicle.location
          .toLowerCase()
          .includes(value)

      );
    }
  );

  // =========================================================
  // TOTAL VEHICLES
  // =========================================================

  const totalVehicles = vehicles.length;

  // =========================================================
  // GENERATE VEHICLE ID
  // =========================================================

  const generateVehicleId = () => {

    let highestNumber = 0;

    vehicles.forEach((vehicle) => {

      const match =
        String(vehicle.id).match(
          /^VEH-(\d+)$/
        );

      if (match) {

        const number =
          parseInt(match[1], 10);

        if (number > highestNumber) {
          highestNumber = number;
        }
      }
    });

    return `VEH-${String(
      highestNumber + 1
    ).padStart(3, "0")}`;
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {

    if (status === "Available") {

      return (
        <CheckCircle2 size={14} />
      );
    }

    if (status === "Maintenance") {

      return (
        <Wrench size={14} />
      );
    }

    return (
      <Car size={14} />
    );
  };

  // =========================================================
  // OPEN ADD VEHICLE
  // =========================================================

  const openAddVehicle = () => {

    setEditingVehicle(null);

    setVehicleForm({
      name: "",
      number: "",
      type: "Sedan",
      driverId: "",
      driver: "",
      status: "Available",
      location: "",
    });

    setShowVehicleModal(true);
  };

  // =========================================================
  // OPEN EDIT VEHICLE
  // =========================================================

  const openEditVehicle = (vehicle) => {

    setEditingVehicle(vehicle);

    setVehicleForm({
      name: vehicle.name || "",
      number: vehicle.number || "",
      type: vehicle.type || "Sedan",

      driverId: vehicle.driverId || "",

      driver: vehicle.driver || "",

      status: vehicle.status || "Available",

      location: vehicle.location || "",
    });

    setShowVehicleModal(true);
  };

  // =========================================================
  // CLOSE VEHICLE MODAL
  // =========================================================

  const closeVehicleModal = () => {

    if (saving) return;

    setShowVehicleModal(false);

    setEditingVehicle(null);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleVehicleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setVehicleForm((previous) => ({

      ...previous,

      [name]: value,

    }));
  };

  // =========================================================
  // DRIVER SELECTION
  // =========================================================

  const handleDriverChange = (e) => {

    const driverId =
      e.target.value;

    if (!driverId) {

      setVehicleForm((previous) => ({

        ...previous,

        driverId: "",

        driver: "Unassigned",

      }));

      return;
    }

    const selectedDriver =
      drivers.find(
        (driver) =>
          driver.firebaseId === driverId
      );

    if (!selectedDriver) return;

    // -------------------------------------------------------
    // Check whether selected driver already has another
    // vehicle.
    // -------------------------------------------------------

    const existingVehicle = vehicles.find(
      (vehicle) =>
        vehicle.driverId ===
        selectedDriver.firebaseId &&
        vehicle.firebaseId !==
          editingVehicle?.firebaseId
    );

    if (existingVehicle) {

      const shouldReplace =
        window.confirm(
          `${selectedDriver.name} is already assigned to ${existingVehicle.name} (${existingVehicle.number}).\n\nDo you want to move the driver to this vehicle?`
        );

      if (!shouldReplace) {
        return;
      }
    }

    setVehicleForm((previous) => ({

      ...previous,

      driverId:
        selectedDriver.firebaseId,

      driver:
        selectedDriver.name,

    }));
  };

  // =========================================================
  // SAVE VEHICLE
  // =========================================================

  const saveVehicle = async (e) => {

    e.preventDefault();

    if (saving) return;

    const name =
      vehicleForm.name.trim();

    const number =
      vehicleForm.number.trim();

    const location =
      vehicleForm.location.trim();

    if (
      !name ||
      !number ||
      !location
    ) {

      alert(
        "Please fill in all required fields."
      );

      return;
    }

    try {

      setSaving(true);

      const batch = writeBatch(db);

      // =====================================================
      // EDIT EXISTING VEHICLE
      // =====================================================

      if (editingVehicle) {

        const previousDriverId =
          editingVehicle.driverId || "";

        const newDriverId =
          vehicleForm.driverId || "";

        // ---------------------------------------------------
        // Update vehicle document
        // ---------------------------------------------------

        batch.update(
          doc(
            db,
            "vehicles",
            editingVehicle.firebaseId
          ),
          {
            name,

            number:
              number.toUpperCase(),

            type:
              vehicleForm.type,

            driverId:
              newDriverId,

            driver:
              vehicleForm.driver ||
              "Unassigned",

            status:
              vehicleForm.status,

            location,

            updatedAt:
              serverTimestamp(),
          }
        );

        // ---------------------------------------------------
        // Driver changed
        // ---------------------------------------------------

        if (
          previousDriverId &&
          previousDriverId !== newDriverId
        ) {

          const previousDriver =
            drivers.find(
              (driver) =>
                driver.firebaseId ===
                previousDriverId
            );

          if (previousDriver) {

            batch.update(
              doc(
                db,
                "drivers",
                previousDriver.firebaseId
              ),
              {
                vehicleId: "",
              }
            );
          }
        }

        // ---------------------------------------------------
        // Assign new driver
        // ---------------------------------------------------

        if (newDriverId) {

          const newDriver =
            drivers.find(
              (driver) =>
                driver.firebaseId ===
                newDriverId
            );

          if (newDriver) {

            // ------------------------------------------------
            // If this driver was assigned to another vehicle,
            // unassign that old vehicle.
            // ------------------------------------------------

            const oldVehicle =
              vehicles.find(
                (vehicle) =>
                  vehicle.driverId ===
                    newDriver.firebaseId &&
                  vehicle.firebaseId !==
                    editingVehicle.firebaseId
              );

            if (oldVehicle) {

              batch.update(
                doc(
                  db,
                  "vehicles",
                  oldVehicle.firebaseId
                ),
                {
                  driverId: "",
                  driver: "Unassigned",
                  updatedAt:
                    serverTimestamp(),
                }
              );
            }

            // ------------------------------------------------
            // Update driver
            // ------------------------------------------------

            batch.update(
              doc(
                db,
                "drivers",
                newDriver.firebaseId
              ),
              {
                vehicleId:
                  editingVehicle.firebaseId,
              }
            );
          }
        }
      }

      // =====================================================
      // ADD NEW VEHICLE
      // =====================================================

      else {

        const vehicleId =
          generateVehicleId();

        const newVehicleRef =
          doc(collection(db, "vehicles"));

        const selectedDriver =
          drivers.find(
            (driver) =>
              driver.firebaseId ===
              vehicleForm.driverId
          );

        // ---------------------------------------------------
        // Add vehicle
        // ---------------------------------------------------

        batch.set(
          newVehicleRef,
          {
            id: vehicleId,

            name,

            number:
              number.toUpperCase(),

            type:
              vehicleForm.type,

            driverId:
              selectedDriver?.firebaseId ||
              "",

            driver:
              selectedDriver?.name ||
              "Unassigned",

            status:
              vehicleForm.status,

            location,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

        // ---------------------------------------------------
        // Assign driver
        // ---------------------------------------------------

        if (selectedDriver) {

          // Check if driver already has vehicle.

          const oldVehicle =
            vehicles.find(
              (vehicle) =>
                vehicle.driverId ===
                selectedDriver.firebaseId
            );

          if (oldVehicle) {

            batch.update(
              doc(
                db,
                "vehicles",
                oldVehicle.firebaseId
              ),
              {
                driverId: "",
                driver: "Unassigned",
                updatedAt:
                  serverTimestamp(),
              }
            );
          }

          batch.update(
            doc(
              db,
              "drivers",
              selectedDriver.firebaseId
            ),
            {
              vehicleId:
                newVehicleRef.id,
            }
          );
        }
      }

      // =====================================================
      // COMMIT EVERYTHING TO FIREBASE
      // =====================================================

      await batch.commit();

      setShowVehicleModal(false);
      setEditingVehicle(null);

    } catch (firebaseError) {

      console.error(
        "Error saving vehicle:",
        firebaseError
      );

      alert(
        "Failed to save vehicle. Please try again."
      );

    } finally {

      setSaving(false);

    }
  };

  // =========================================================
  // DELETE VEHICLE
  // =========================================================

  const deleteVehicle = async () => {

    if (
      !vehicleToDelete ||
      deleting
    ) {
      return;
    }

    try {

      setDeleting(true);

      const batch = writeBatch(db);

      // -----------------------------------------------------
      // Unassign driver
      // -----------------------------------------------------

      if (vehicleToDelete.driverId) {

        const assignedDriver =
          drivers.find(
            (driver) =>
              driver.firebaseId ===
              vehicleToDelete.driverId
          );

        if (assignedDriver) {

          batch.update(
            doc(
              db,
              "drivers",
              assignedDriver.firebaseId
            ),
            {
              vehicleId: "",
            }
          );
        }
      }

      // -----------------------------------------------------
      // Delete vehicle
      // -----------------------------------------------------

      batch.delete(
        doc(
          db,
          "vehicles",
          vehicleToDelete.firebaseId
        )
      );

      await batch.commit();

      if (
        selectedVehicle?.firebaseId ===
        vehicleToDelete.firebaseId
      ) {

        setSelectedVehicle(null);
      }

      setVehicleToDelete(null);

    } catch (firebaseError) {

      console.error(
        "Error deleting vehicle:",
        firebaseError
      );

      alert(
        "Failed to remove vehicle."
      );

    } finally {

      setDeleting(false);

    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="vehicles-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="vehicles-header">

        <div>

          <span className="vehicles-eyebrow">
            FLEET MANAGEMENT
          </span>

          <h1>
            Vehicles
          </h1>

          <p>
            Manage and monitor all vehicles in your fleet.
          </p>

        </div>

        <div className="vehicles-total-card">

          <span>
            Total Vehicles
          </span>

          <strong>
            {totalVehicles}
          </strong>

        </div>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="vehicles-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
        }}
      >

        <div className="vehicles-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by vehicle, number, driver..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <X size={16} />
            </button>

          )}

        </div>

        <button
          type="button"
          onClick={openAddVehicle}
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
          + Add Vehicle
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          style={{
            marginBottom: "15px",
            padding: "13px 16px",
            borderRadius: "9px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {error}
        </div>

      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="vehicles-card">

        <div className="vehicles-table-wrapper">

          {loading ? (

            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading vehicles...
            </div>

          ) : (

            <table className="vehicles-table">

              <thead>

                <tr>

                  <th>
                    VEHICLE ID
                  </th>

                  <th>
                    VEHICLE
                  </th>

                  <th>
                    NUMBER
                  </th>

                  <th>
                    TYPE
                  </th>

                  <th>
                    DRIVER
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTIONS
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredVehicles.length > 0 ? (

                  filteredVehicles.map(
                    (vehicle) => (

                      <tr
                        key={vehicle.firebaseId}
                        onClick={() =>
                          setSelectedVehicle(vehicle)
                        }
                        className="vehicle-row"
                      >

                        <td>

                          <span className="vehicle-id">
                            {vehicle.id}
                          </span>

                        </td>

                        <td>

                          <div className="vehicle-name">

                            <div className="vehicle-icon">
                              <Car size={18} />
                            </div>

                            <div>

                              <strong>
                                {vehicle.name}
                              </strong>

                              <span>
                                {vehicle.location}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="vehicle-number">
                            {vehicle.number}
                          </span>

                        </td>

                        <td>

                          <span className="vehicle-type">
                            {vehicle.type}
                          </span>

                        </td>

                        <td>

                          <span className="vehicle-driver">
                            {vehicle.driver ||
                              "Unassigned"}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`vehicle-status ${
                              vehicle.status
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )
                            }`}
                          >

                            {getStatusIcon(
                              vehicle.status
                            )}

                            {vehicle.status}

                          </span>

                        </td>

                        <td>

                          <div
                            className="vehicle-actions"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >

                            <button
                              type="button"
                              className="vehicle-action-btn"
                              title="Edit vehicle"
                              onClick={() =>
                                openEditVehicle(
                                  vehicle
                                )
                              }
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              className="vehicle-action-btn vehicle-delete-btn"
                              title="Delete vehicle"
                              onClick={() =>
                                setVehicleToDelete(
                                  vehicle
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>

                            <button
                              type="button"
                              className="vehicle-action-btn"
                              title="More"
                              onClick={() =>
                                setSelectedVehicle(
                                  vehicle
                                )
                              }
                            >
                              <MoreHorizontal
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="vehicles-empty"
                    >

                      <Car size={38} />

                      <strong>
                        No vehicles found
                      </strong>

                      <span>
                        {vehicles.length === 0
                          ? "No vehicles have been added yet."
                          : "Try changing your search."
                        }
                      </span>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          )}

        </div>

        <div className="vehicles-footer">

          Showing{" "}

          <strong>
            {filteredVehicles.length}
          </strong>{" "}

          of{" "}

          <strong>
            {vehicles.length}
          </strong>{" "}

          vehicles

        </div>

      </div>

      {/* =====================================================
          DETAILS PANEL
      ===================================================== */}

      {selectedVehicle && (

        <>

          <div
            className="vehicle-panel-overlay"
            onClick={() =>
              setSelectedVehicle(null)
            }
          />

          <aside className="vehicle-details-panel">

            <div className="vehicle-panel-header">

              <div>

                <span>
                  VEHICLE DETAILS
                </span>

                <h2>
                  {selectedVehicle.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVehicle(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* VEHICLE PROFILE */}

            <div className="vehicle-profile">

              <div className="vehicle-large-icon">

                <Car size={34} />

              </div>

              <div>

                <h3>
                  {selectedVehicle.name}
                </h3>

                <span>
                  {selectedVehicle.id}
                </span>

              </div>

            </div>

            {/* DETAILS */}

            <div className="vehicle-details-list">

              <div>

                <span>
                  Vehicle Number
                </span>

                <strong>
                  {selectedVehicle.number}
                </strong>

              </div>

              <div>

                <span>
                  Vehicle Type
                </span>

                <strong>
                  {selectedVehicle.type}
                </strong>

              </div>

              <div>

                <span>
                  Assigned Driver
                </span>

                <strong>
                  {selectedVehicle.driver ||
                    "Unassigned"}
                </strong>

              </div>

              <div>

                <span>
                  Location
                </span>

                <strong className="vehicle-location">

                  <MapPin size={15} />

                  {selectedVehicle.location}

                </strong>

              </div>

              <div>

                <span>
                  Status
                </span>

                <strong>

                  <span
                    className={`vehicle-status ${
                      selectedVehicle.status
                        .toLowerCase()
                        .replace(
                          " ",
                          "-"
                        )
                    }`}
                  >

                    {getStatusIcon(
                      selectedVehicle.status
                    )}

                    {selectedVehicle.status}

                  </span>

                </strong>

              </div>

            </div>

            {/* PANEL ACTIONS */}

            <div className="vehicle-panel-actions">

              <button
                type="button"
                className="vehicle-edit-full"
                onClick={() =>
                  openEditVehicle(
                    selectedVehicle
                  )
                }
              >

                <Pencil size={16} />

                Edit Vehicle

              </button>

              <button
                type="button"
                className="vehicle-remove-full"
                onClick={() =>
                  setVehicleToDelete(
                    selectedVehicle
                  )
                }
              >

                <Trash2 size={16} />

                Remove Vehicle

              </button>

            </div>

          </aside>

        </>

      )}

      {/* =====================================================
          ADD / EDIT VEHICLE MODAL
      ===================================================== */}

      {showVehicleModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 10000,
          }}
          onClick={closeVehicleModal}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "26px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.20)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                marginBottom: "24px",
              }}
            >

              <div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing:
                      "1.5px",
                    color: "#7a8ca3",
                  }}
                >
                  FLEET MANAGEMENT
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: "24px",
                    color: "#111827",
                  }}
                >
                  {editingVehicle
                    ? "Edit Vehicle"
                    : "Add Vehicle"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeVehicleModal}
                style={{
                  border: "none",
                  background:
                    "#f3f4f6",
                  width: "36px",
                  height: "36px",
                  borderRadius:
                    "50%",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveVehicle}>

              {/* VEHICLE NAME */}

              <div style={formGroup}>

                <label style={formLabel}>
                  Vehicle Name
                </label>

                <input
                  name="name"
                  type="text"
                  placeholder="Swift Dzire"
                  value={vehicleForm.name}
                  onChange={
                    handleVehicleChange
                  }
                  style={formInput}
                  required
                />

              </div>

              {/* VEHICLE NUMBER */}

              <div style={formGroup}>

                <label style={formLabel}>
                  Registration Number
                </label>

                <input
                  name="number"
                  type="text"
                  placeholder="PB-36-A-1234"
                  value={vehicleForm.number}
                  onChange={
                    handleVehicleChange
                  }
                  style={formInput}
                  required
                />

              </div>

              {/* TYPE + STATUS */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "15px",
                }}
              >

                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <label style={formLabel}>
                    Vehicle Type
                  </label>

                  <select
                    name="type"
                    value={vehicleForm.type}
                    onChange={
                      handleVehicleChange
                    }
                    style={formInput}
                  >

                    <option value="Sedan">
                      Sedan
                    </option>

                    <option value="SUV">
                      SUV
                    </option>

                    <option value="Premium">
                      Premium
                    </option>

                    <option value="Hatchback">
                      Hatchback
                    </option>

                    <option value="MUV">
                      MUV
                    </option>

                  </select>

                </div>

                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <label style={formLabel}>
                    Status
                  </label>

                  <select
                    name="status"
                    value={vehicleForm.status}
                    onChange={
                      handleVehicleChange
                    }
                    style={formInput}
                  >

                    <option value="Available">
                      Available
                    </option>

                    <option value="On Trip">
                      On Trip
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                  </select>

                </div>

              </div>

              {/* DRIVER */}

              <div style={formGroup}>

                <label style={formLabel}>
                  Assigned Driver
                </label>

                <select
                  value={
                    vehicleForm.driverId
                  }
                  onChange={
                    handleDriverChange
                  }
                  style={formInput}
                >

                  <option value="">
                    Unassigned
                  </option>

                  {drivers.map(
                    (driver) => (

                      <option
                        key={
                          driver.firebaseId
                        }
                        value={
                          driver.firebaseId
                        }
                      >

                        {driver.name}

                        {driver.status !==
                          "Active"
                          ? " (Inactive)"
                          : ""}

                      </option>

                    )
                  )}

                </select>

                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Assigning a driver here will
                  automatically update both the
                  vehicle and driver records.
                </div>

              </div>

              {/* LOCATION */}

              <div style={formGroup}>

                <label style={formLabel}>
                  Current Location
                </label>

                <input
                  name="location"
                  type="text"
                  placeholder="Jalandhar"
                  value={
                    vehicleForm.location
                  }
                  onChange={
                    handleVehicleChange
                  }
                  style={formInput}
                  required
                />

              </div>

              {/* AUTO ID */}

              {!editingVehicle && (

                <div
                  style={{
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    background:
                      "#f8fafc",
                    marginBottom:
                      "20px",
                    fontSize:
                      "13px",
                    color:
                      "#64748b",
                  }}
                >

                  Vehicle ID will be
                  automatically generated
                  as{" "}

                  <strong
                    style={{
                      color:
                        "#111827",
                    }}
                  >
                    {generateVehicleId()}
                  </strong>

                </div>

              )}

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeVehicleModal
                  }
                  disabled={saving}
                  style={{
                    border:
                      "1px solid #e5e7eb",
                    background:
                      "#ffffff",
                    color:
                      "#374151",
                    padding:
                      "11px 18px",
                    borderRadius:
                      "8px",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    background:
                      "#111111",
                    color:
                      "#ffffff",
                    padding:
                      "11px 20px",
                    borderRadius:
                      "8px",
                    fontWeight:
                      "600",
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      saving
                        ? 0.6
                        : 1,
                  }}
                >

                  {saving
                    ? "Saving..."
                    : editingVehicle
                    ? "Save Changes"
                    : "Add Vehicle"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {vehicleToDelete && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 11000,
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.20)",
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "50%",
                background:
                  "#fef2f2",
                color:
                  "#dc2626",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontWeight:
                  "700",
                fontSize: "20px",
              }}
            >
              !
            </div>

            <h3
              style={{
                margin:
                  "0 0 8px",
                color:
                  "#111827",
              }}
            >
              Remove Vehicle?
            </h3>

            <p
              style={{
                margin:
                  "0 0 24px",
                color:
                  "#6b7280",
                fontSize:
                  "14px",
                lineHeight:
                  "1.6",
              }}
            >

              Are you sure you want to
              remove{" "}

              <strong>
                {vehicleToDelete.name}
              </strong>
              ?

              <br />

              {vehicleToDelete.driverId && (
                <>
                  The assigned driver will become
                  <strong> Unassigned</strong>.
                  <br />
                </>
              )}

              This action cannot be undone.

            </p>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "10px",
              }}
            >

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setVehicleToDelete(
                    null
                  )
                }
                style={{
                  border:
                    "1px solid #e5e7eb",
                  background:
                    "#ffffff",
                  color:
                    "#374151",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "600",
                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={
                  deleteVehicle
                }
                style={{
                  border: "none",
                  background:
                    "#dc2626",
                  color:
                    "#ffffff",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "600",
                  cursor:
                    "pointer",
                  opacity:
                    deleting
                      ? 0.6
                      : 1,
                }}
              >

                {deleting
                  ? "Removing..."
                  : "Remove Vehicle"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// =========================================================
// FORM STYLES
// =========================================================

const formGroup = {
  marginBottom: "15px",
};

const formLabel = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "7px",
};

const formInput = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "11px 12px",
  fontSize: "14px",
  color: "#111827",
  background: "#ffffff",
  outline: "none",
};

export default AdminVehicles;