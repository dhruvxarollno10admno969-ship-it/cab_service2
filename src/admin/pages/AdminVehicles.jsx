
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  CarFront,
  MapPin,
  Users,
  BriefcaseBusiness,
  IndianRupee,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

import { db } from "../../firebase";
import "../styles/vehicles.css";

const VEHICLES_COLLECTION = "vehicles";
const DRIVERS_COLLECTION = "drivers";

const EMPTY_FORM = {
  name: "",
  number: "",
  type: "Sedan",
  driverId: "",
  driver: "",
  status: "Available",
  location: "",
  image: "",
  description: "",
  pricePerKm: "12",
  passengers: "4",
  luggage: "2",
};

function getDefaultsByType(type) {
  switch (type) {
    case "SUV":
      return { pricePerKm: "16", passengers: "6", luggage: "4" };

    case "Premium":
      return { pricePerKm: "22", passengers: "4", luggage: "3" };

    case "Hatchback":
      return { pricePerKm: "10", passengers: "4", luggage: "2" };

    case "MUV":
      return { pricePerKm: "18", passengers: "7", luggage: "4" };

    default:
      return { pricePerKm: "12", passengers: "4", luggage: "2" };
  }
}

/* =========================================
   REUSABLE VEHICLE IMAGE
========================================= */

function VehicleThumbnail({ src, name }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!src || imageError) {
    return (
      <span className="vehicles-thumbnail-placeholder">
        <CarFront size={21} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Vehicle"}
      className="vehicles-thumbnail"
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
}

/* =========================================
   ADMIN VEHICLES
========================================= */

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_FORM);

  /* =========================================
     FIREBASE VEHICLE LISTENER
  ========================================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, VEHICLES_COLLECTION),
      (snapshot) => {
        const vehicleList = snapshot.docs.map((firebaseDoc) => {
          const data = firebaseDoc.data();
          const defaults = getDefaultsByType(data.type || "Sedan");

          return {
            firebaseId: firebaseDoc.id,
            id: data.id || firebaseDoc.id,

            name: data.name || "",
            number: data.number || "",
            type: data.type || "Sedan",

            driverId: data.driverId || "",
            driver: data.driver || "Unassigned",

            status: data.status || "Available",
            location: data.location || "",

            image: data.image || "",
            description: data.description || "",

            pricePerKm: Number(
              data.pricePerKm ?? defaults.pricePerKm
            ),

            passengers: String(
              data.passengers ?? defaults.passengers
            ),

            luggage: String(
              data.luggage ?? defaults.luggage
            ),

            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          };
        });

        setVehicles(vehicleList);
        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Error loading vehicles:", firebaseError);
        setError("Unable to load vehicles. Check Firebase and Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================
     FIREBASE DRIVER LISTENER
  ========================================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, DRIVERS_COLLECTION),
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
            vehicleId: data.vehicleId || "",
          };
        });

        setDrivers(driverList);
      },
      (firebaseError) => {
        console.error("Error loading drivers:", firebaseError);
        setError("Unable to load drivers. Check your Firestore rules.");
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================
     FORM FIELD HANDLING
  ========================================= */

  function updateField(event) {
    const { name, value } = event.target;

    setVehicleForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "type") {
        const defaults = getDefaultsByType(value);

        updated.pricePerKm = defaults.pricePerKm;
        updated.passengers = defaults.passengers;
        updated.luggage = defaults.luggage;
      }

      return updated;
    });
  }

  /* =========================================
     MANUAL DRIVER SELECTION
  ========================================= */

  function handleDriverSelection(event) {
    const selectedId = event.target.value;

    const selectedDriver = drivers.find(
      (driver) => driver.firebaseId === selectedId
    );

    setVehicleForm((previous) => ({
      ...previous,
      driverId: selectedDriver?.firebaseId || "",
      driver: selectedDriver?.name || "",
    }));
  }

  /* =========================================
     OPEN ADD VEHICLE
  ========================================= */

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  }

  /* =========================================
     OPEN EDIT VEHICLE
  ========================================= */

  function openEditVehicle(vehicle) {
    setEditingVehicle(vehicle);

    setVehicleForm({
      name: vehicle.name,
      number: vehicle.number,
      type: vehicle.type,
      driverId: vehicle.driverId || "",
      driver: vehicle.driver === "Unassigned" ? "" : vehicle.driver,
      status: vehicle.status,
      location: vehicle.location,
      image: vehicle.image,
      description: vehicle.description,
      pricePerKm: String(vehicle.pricePerKm),
      passengers: String(vehicle.passengers),
      luggage: String(vehicle.luggage),
    });

    setError("");
    setShowForm(true);
  }

  /* =========================================
     CLOSE FORM
  ========================================= */

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingVehicle(null);
    setVehicleForm({ ...EMPTY_FORM });
    setError("");
  }

  /* =========================================
     SAVE / UPDATE VEHICLE
     MANUAL DRIVER ASSIGNMENT
  ========================================= */

  async function saveVehicle(event) {
    event.preventDefault();
    setError("");

    const name = vehicleForm.name.trim();
    const number = vehicleForm.number.trim();
    const location = vehicleForm.location.trim();
    const image = vehicleForm.image.trim();

    const pricePerKm = Number(vehicleForm.pricePerKm);
    const passengers = Number(vehicleForm.passengers);
    const luggage = Number(vehicleForm.luggage);

    if (!name || !number || !location) {
      setError(
        "Please enter the vehicle name, registration number and location."
      );
      return;
    }

    if (
      !Number.isFinite(pricePerKm) ||
      pricePerKm < 0 ||
      !Number.isInteger(passengers) ||
      passengers < 1 ||
      !Number.isInteger(luggage) ||
      luggage < 0
    ) {
      setError(
        "Enter a valid price, passenger capacity and luggage capacity."
      );
      return;
    }

    if (image) {
      try {
        const parsedURL = new URL(image);

        if (
          parsedURL.protocol !== "https:" &&
          parsedURL.protocol !== "http:"
        ) {
          throw new Error("Invalid image URL");
        }
      } catch {
        setError("Please enter a valid image URL.");
        return;
      }
    }

    const selectedDriverId = vehicleForm.driverId.trim();

    const selectedDriver = selectedDriverId
      ? drivers.find(
          (driver) => driver.firebaseId === selectedDriverId
        )
      : null;

    if (selectedDriverId && !selectedDriver) {
      setError(
        "The selected driver could not be found. Please refresh and select again."
      );
      return;
    }

    const vehicleData = {
      name,
      number,
      type: vehicleForm.type,

      driverId: selectedDriver?.firebaseId || "",
      driver: selectedDriver?.name || "Unassigned",

      status: vehicleForm.status,
      location,
      image,
      description: vehicleForm.description.trim(),

      pricePerKm,
      passengers,
      luggage,

      updatedAt: serverTimestamp(),
    };

    setSaving(true);

    try {
      const vehicleRef = editingVehicle
        ? doc(db, VEHICLES_COLLECTION, editingVehicle.firebaseId)
        : doc(collection(db, VEHICLES_COLLECTION));

      await runTransaction(db, async (transaction) => {
        // READ 1: Existing vehicle, if editing.
        let currentVehicleData = {};

        if (editingVehicle) {
          const vehicleSnapshot = await transaction.get(vehicleRef);

          if (!vehicleSnapshot.exists()) {
            throw new Error("This vehicle no longer exists.");
          }

          currentVehicleData = vehicleSnapshot.data();
        }

        const previousDriverId = currentVehicleData.driverId || "";

        // READ 2: Manually selected driver.
        let selectedDriverRef = null;
        let selectedDriverData = null;

        if (selectedDriverId) {
          selectedDriverRef = doc(
            db,
            DRIVERS_COLLECTION,
            selectedDriverId
          );

          const selectedSnapshot = await transaction.get(
            selectedDriverRef
          );

          if (!selectedSnapshot.exists()) {
            throw new Error("The selected driver no longer exists.");
          }

          selectedDriverData = selectedSnapshot.data();
        }

        // READ 3: Previously assigned driver.
        let previousDriverRef = null;
        let previousDriverData = null;

        if (
          previousDriverId &&
          previousDriverId !== selectedDriverId
        ) {
          previousDriverRef = doc(
            db,
            DRIVERS_COLLECTION,
            previousDriverId
          );

          const previousSnapshot = await transaction.get(
            previousDriverRef
          );

          if (previousSnapshot.exists()) {
            previousDriverData = previousSnapshot.data();
          }
        }

        // READ 4: Previous vehicle of the selected driver.
        let previousVehicleRef = null;
        let previousVehicleData = null;

        const previousVehicleId =
          selectedDriverData?.vehicleId || "";

        if (
          previousVehicleId &&
          previousVehicleId !== vehicleRef.id
        ) {
          previousVehicleRef = doc(
            db,
            VEHICLES_COLLECTION,
            previousVehicleId
          );

          const previousVehicleSnapshot = await transaction.get(
            previousVehicleRef
          );

          if (previousVehicleSnapshot.exists()) {
            previousVehicleData = previousVehicleSnapshot.data();
          }
        }

        // All reads are complete. Now perform writes.

        // Clear the old driver's assignment.
        if (
          previousDriverRef &&
          previousDriverData?.vehicleId === vehicleRef.id
        ) {
          transaction.update(previousDriverRef, {
            vehicleId: "",
            updatedAt: serverTimestamp(),
          });
        }

        // If the selected driver already has another vehicle,
        // unassign that vehicle.
        if (
          previousVehicleRef &&
          previousVehicleData?.driverId === selectedDriverId
        ) {
          transaction.update(previousVehicleRef, {
            driverId: "",
            driver: "Unassigned",
            updatedAt: serverTimestamp(),
          });
        }

        // Save the vehicle.
        if (editingVehicle) {
          transaction.update(vehicleRef, vehicleData);
        } else {
          transaction.set(vehicleRef, {
            ...vehicleData,
            createdAt: serverTimestamp(),
          });
        }

        // Assign the selected driver to this vehicle.
        if (selectedDriverRef) {
          transaction.update(selectedDriverRef, {
            vehicleId: vehicleRef.id,
            updatedAt: serverTimestamp(),
          });
        }
      });

      console.log("Vehicle saved and driver assignment synchronized.");

      setShowForm(false);
      setEditingVehicle(null);
      setVehicleForm({ ...EMPTY_FORM });
      setError("");
    } catch (firebaseError) {
      console.error("Error saving vehicle:", firebaseError);

      setError(
        firebaseError.message ||
          "Could not save the vehicle. Check your Firebase connection and Firestore rules."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     DELETE VEHICLE
     ALSO UNASSIGN DRIVER
  ========================================= */

  async function removeVehicle(vehicle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const vehicleRef = doc(
        db,
        VEHICLES_COLLECTION,
        vehicle.firebaseId
      );

      await runTransaction(db, async (transaction) => {
        const vehicleSnapshot = await transaction.get(vehicleRef);

        if (!vehicleSnapshot.exists()) {
          throw new Error("This vehicle no longer exists.");
        }

        const currentData = vehicleSnapshot.data();
        const assignedDriverId = currentData.driverId || "";

        let assignedDriverRef = null;
        let assignedDriverData = null;

        // Fallback for older records where driverId is missing
        // but the driver still references this vehicle.
        const matchingDriver = drivers.find(
          (driver) => driver.vehicleId === vehicle.firebaseId
        );

        const driverIdToCheck =
          assignedDriverId || matchingDriver?.firebaseId || "";

        if (driverIdToCheck) {
          assignedDriverRef = doc(
            db,
            DRIVERS_COLLECTION,
            driverIdToCheck
          );

          const driverSnapshot = await transaction.get(
            assignedDriverRef
          );

          if (driverSnapshot.exists()) {
            assignedDriverData = driverSnapshot.data();
          }
        }

        // Unassign driver if this vehicle belongs to them.
        if (
          assignedDriverRef &&
          assignedDriverData?.vehicleId === vehicle.firebaseId
        ) {
          transaction.update(assignedDriverRef, {
            vehicleId: "",
            updatedAt: serverTimestamp(),
          });
        }

        transaction.delete(vehicleRef);
      });

      console.log("Vehicle deleted successfully.");
    } catch (firebaseError) {
      console.error("Error deleting vehicle:", firebaseError);

      setError(
        firebaseError.message ||
          "Could not delete the vehicle. Check your Firestore rules."
      );
    }
  }

  /* =========================================
     VEHICLE STATISTICS
  ========================================= */

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.status === "Available"
  ).length;

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="vehicles-page">

      {/* HEADER */}

      <div className="vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>Manage your fleet and vehicle information.</p>
        </div>

        <button
          type="button"
          className="vehicles-add-btn"
          onClick={openAddVehicle}
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* STATISTICS */}

      <div className="vehicles-stats">

        <div className="vehicles-stat-card">
          <span className="vehicles-stat-icon">
            <CarFront size={21} />
          </span>

          <div>
            <p>Total Vehicles</p>
            <h2>{vehicles.length}</h2>
          </div>
        </div>

        <div className="vehicles-stat-card">
          <span className="vehicles-stat-icon">
            <RefreshCw size={21} />
          </span>

          <div>
            <p>Available</p>
            <h2>{availableCount}</h2>
          </div>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="vehicles-error">
          {error}
        </div>
      )}

      {/* VEHICLE TABLE */}

      <div className="vehicles-content">

        <div className="vehicles-content-header">
          <h2>All Vehicles</h2>
          <span>{vehicles.length} vehicles</span>
        </div>

        {loading ? (
          <div className="vehicles-empty">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="vehicles-empty">
            <CarFront size={38} />

            <h3>No vehicles added yet</h3>

            <p>
              Add your first vehicle to your MANZILL 777 fleet.
            </p>

            <button
              type="button"
              className="vehicles-add-btn"
              onClick={openAddVehicle}
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="vehicles-table-wrapper">

            <table className="vehicles-table">

              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Type</th>
                  <th>Driver</th>
                  <th>Price / km</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.firebaseId}>

                    <td>
                      <div className="vehicles-name-cell">

                        <VehicleThumbnail
                          src={vehicle.image}
                          name={vehicle.name}
                        />

                        <div>
                          <strong>{vehicle.name}</strong>
                          <small>{vehicle.location}</small>
                        </div>

                      </div>
                    </td>

                    <td>{vehicle.number}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.driver || "Unassigned"}</td>
                    <td>₹{vehicle.pricePerKm}</td>

                    <td>
                      <span
                        className={`vehicles-status ${
                          vehicle.status === "Available"
                            ? "status-available"
                            : vehicle.status === "On Trip"
                              ? "status-on-trip"
                              : "status-maintenance"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>

                    <td>
                      <div className="vehicles-actions">

                        <button
                          type="button"
                          className="vehicles-edit-btn"
                          title="Edit vehicle"
                          onClick={() => openEditVehicle(vehicle)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="vehicles-delete-btn"
                          title="Delete vehicle"
                          onClick={() => removeVehicle(vehicle)}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="vehicles-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >

          <div
            className="vehicles-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-form-title"
          >

            <div className="vehicles-modal-header">

              <div>
                <h2 id="vehicle-form-title">
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>

                <p>
                  Vehicle information will be saved to Firebase.
                </p>
              </div>

              <button
                type="button"
                className="vehicles-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={saveVehicle}>

              <div className="vehicles-form-grid">

                <label className="vehicles-form-group">
                  <span>Vehicle Name *</span>

                  <input
                    name="name"
                    value={vehicleForm.name}
                    onChange={updateField}
                    placeholder="e.g. Maruti Suzuki Dzire"
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>Registration Number *</span>

                  <input
                    name="number"
                    value={vehicleForm.number}
                    onChange={updateField}
                    placeholder="e.g. PB09AB1234"
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>Vehicle Type *</span>

                  <select
                    name="type"
                    value={vehicleForm.type}
                    onChange={updateField}
                    required
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Premium">Premium</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MUV">MUV</option>
                  </select>
                </label>

                <label className="vehicles-form-group">
                  <span>Status *</span>

                  <select
                    name="status"
                    value={vehicleForm.status}
                    onChange={updateField}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>

                {/* MANUAL DRIVER DROPDOWN */}

                <label className="vehicles-form-group vehicles-form-full">
                  <span>Assigned Driver</span>

                  <select
                    name="driverId"
                    value={vehicleForm.driverId}
                    onChange={handleDriverSelection}
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {drivers.map((driver) => (
                      <option
                        key={driver.firebaseId}
                        value={driver.firebaseId}
                      >
                        {driver.name} ({driver.id})
                      </option>
                    ))}
                  </select>

                  <small>
                    Select the driver you want to assign to this vehicle.
                  </small>
                </label>

                <label className="vehicles-form-group">
                  <span>
                    <IndianRupee size={15} />
                    Price per kilometre
                  </span>

                  <input
                    name="pricePerKm"
                    type="number"
                    min="0"
                    step="0.5"
                    value={vehicleForm.pricePerKm}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>
                    <Users size={15} />
                    Passenger Capacity
                  </span>

                  <input
                    name="passengers"
                    type="number"
                    min="1"
                    value={vehicleForm.passengers}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>
                    <BriefcaseBusiness size={15} />
                    Luggage Capacity
                  </span>

                  <input
                    name="luggage"
                    type="number"
                    min="0"
                    value={vehicleForm.luggage}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>
                    <MapPin size={15} />
                    Current Location *
                  </span>

                  <input
                    name="location"
                    value={vehicleForm.location}
                    onChange={updateField}
                    placeholder="e.g. Phagwara"
                    required
                  />
                </label>

                <label className="vehicles-form-group vehicles-form-full">
                  <span>
                    <ImageIcon size={15} />
                    Vehicle Image URL
                  </span>

                  <input
                    name="image"
                    type="url"
                    value={vehicleForm.image}
                    onChange={updateField}
                    placeholder="https://example.com/vehicle.jpg"
                  />

                  <small>
                    Use a publicly accessible direct image URL.
                  </small>
                </label>

                <label className="vehicles-form-group vehicles-form-full">
                  <span>Description</span>

                  <textarea
                    name="description"
                    value={vehicleForm.description}
                    onChange={updateField}
                    placeholder="Describe the vehicle's comfort and features..."
                    rows={3}
                  />
                </label>

              </div>

              {error && (
                <div className="vehicles-error vehicles-form-error">
                  {error}
                </div>
              )}

              <div className="vehicles-form-actions">

                <button
                  type="button"
                  className="vehicles-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vehicles-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingVehicle
                      ? "Update Vehicle"
                      : "Save Vehicle"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminVehicles;
