import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
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
  oneWayPricePerKm: "12",
  roadTripPricePerKm: "12",
  passengers: "4",
  luggage: "2",
};

function getDefaultsByType(type) {
  let price = "12";
  let passengers = "4";
  let luggage = "2";

  switch (type) {
    case "SUV":
      price = "16";
      passengers = "6";
      luggage = "4";
      break;
    case "Premium":
      price = "22";
      passengers = "4";
      luggage = "3";
      break;
    case "Hatchback":
      price = "10";
      passengers = "4";
      luggage = "2";
      break;
    case "MUV":
      price = "18";
      passengers = "7";
      luggage = "4";
      break;
    default:
      break;
  }

  // Both trip rates start at the vehicle's existing rate.
  // Admin can edit them independently.
  return {
    oneWayPricePerKm: price,
    roadTripPricePerKm: price,
    passengers,
    luggage,
  };
}

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

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, VEHICLES_COLLECTION),
      (snapshot) => {
        const vehicleList = snapshot.docs.map((firebaseDoc) => {
          const data = firebaseDoc.data();
          const defaults = getDefaultsByType(data.type || "Sedan");

          // Older vehicle documents only have pricePerKm.
          // Use that value for both trip types until admin edits them.
          const legacyPrice = Number(data.pricePerKm ?? 12);

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
            oneWayPricePerKm: Number(
              data.oneWayPricePerKm ?? data.pricePerKm ?? defaults.oneWayPricePerKm
            ),
            roadTripPricePerKm: Number(
              data.roadTripPricePerKm ?? data.pricePerKm ?? defaults.roadTripPricePerKm
            ),
            // Keep this legacy property for older admin UI or app code.
            pricePerKm: Number.isFinite(legacyPrice) ? legacyPrice : 12,
            passengers: String(data.passengers ?? defaults.passengers),
            luggage: String(data.luggage ?? defaults.luggage),
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

  function updateField(event) {
    const { name, value } = event.target;

    setVehicleForm((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === "type") {
        const defaults = getDefaultsByType(value);
        Object.assign(updated, defaults);
      }

      return updated;
    });
  }

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

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  }

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
      oneWayPricePerKm: String(vehicle.oneWayPricePerKm),
      roadTripPricePerKm: String(vehicle.roadTripPricePerKm),
      passengers: String(vehicle.passengers),
      luggage: String(vehicle.luggage),
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingVehicle(null);
    setVehicleForm({ ...EMPTY_FORM });
    setError("");
  }

  async function saveVehicle(event) {
    event.preventDefault();
    setError("");

    const name = vehicleForm.name.trim();
    const number = vehicleForm.number.trim();
    const location = vehicleForm.location.trim();
    const image = vehicleForm.image.trim();

    const oneWayPricePerKm = Number(vehicleForm.oneWayPricePerKm);
    const roadTripPricePerKm = Number(vehicleForm.roadTripPricePerKm);
    const passengers = Number(vehicleForm.passengers);
    const luggage = Number(vehicleForm.luggage);

    if (!name || !number || !location) {
      setError("Please enter the vehicle name, registration number and location.");
      return;
    }

    if (
      !Number.isFinite(oneWayPricePerKm) ||
      oneWayPricePerKm < 0 ||
      !Number.isFinite(roadTripPricePerKm) ||
      roadTripPricePerKm < 0 ||
      !Number.isInteger(passengers) ||
      passengers < 1 ||
      !Number.isInteger(luggage) ||
      luggage < 0
    ) {
      setError("Enter valid trip prices, passenger capacity and luggage capacity.");
      return;
    }

    if (image) {
      try {
        const parsedURL = new URL(image);
        if (parsedURL.protocol !== "https:" && parsedURL.protocol !== "http:") {
          throw new Error("Invalid image URL");
        }
      } catch {
        setError("Please enter a valid image URL.");
        return;
      }
    }

    const selectedDriverId = vehicleForm.driverId.trim();
    const selectedDriver = selectedDriverId
      ? drivers.find((driver) => driver.firebaseId === selectedDriverId)
      : null;

    if (selectedDriverId && !selectedDriver) {
      setError("The selected driver could not be found. Please refresh and select again.");
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

      oneWayPricePerKm,
      roadTripPricePerKm,

      // Backward compatibility: older pages still read pricePerKm.
      pricePerKm: oneWayPricePerKm,

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
        let currentVehicleData = {};

        if (editingVehicle) {
          const vehicleSnapshot = await transaction.get(vehicleRef);
          if (!vehicleSnapshot.exists()) {
            throw new Error("This vehicle no longer exists.");
          }
          currentVehicleData = vehicleSnapshot.data();
        }

        const previousDriverId = currentVehicleData.driverId || "";

        let selectedDriverRef = null;
        let selectedDriverData = null;

        if (selectedDriverId) {
          selectedDriverRef = doc(db, DRIVERS_COLLECTION, selectedDriverId);
          const selectedSnapshot = await transaction.get(selectedDriverRef);

          if (!selectedSnapshot.exists()) {
            throw new Error("The selected driver no longer exists.");
          }

          selectedDriverData = selectedSnapshot.data();
        }

        let previousDriverRef = null;
        let previousDriverData = null;

        if (previousDriverId && previousDriverId !== selectedDriverId) {
          previousDriverRef = doc(db, DRIVERS_COLLECTION, previousDriverId);
          const previousSnapshot = await transaction.get(previousDriverRef);

          if (previousSnapshot.exists()) {
            previousDriverData = previousSnapshot.data();
          }
        }

        let previousVehicleRef = null;
        let previousVehicleData = null;
        const previousVehicleId = selectedDriverData?.vehicleId || "";

        if (previousVehicleId && previousVehicleId !== vehicleRef.id) {
          previousVehicleRef = doc(db, VEHICLES_COLLECTION, previousVehicleId);
          const previousVehicleSnapshot = await transaction.get(previousVehicleRef);

          if (previousVehicleSnapshot.exists()) {
            previousVehicleData = previousVehicleSnapshot.data();
          }
        }

        // All transaction reads are completed before any writes.
        if (
          previousDriverRef &&
          previousDriverData?.vehicleId === vehicleRef.id
        ) {
          transaction.update(previousDriverRef, {
            vehicleId: "",
            updatedAt: serverTimestamp(),
          });
        }

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

        if (editingVehicle) {
          transaction.update(vehicleRef, vehicleData);
        } else {
          transaction.set(vehicleRef, {
            ...vehicleData,
            createdAt: serverTimestamp(),
          });
        }

        if (selectedDriverRef) {
          transaction.update(selectedDriverRef, {
            vehicleId: vehicleRef.id,
            updatedAt: serverTimestamp(),
          });
        }
      });

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

  async function removeVehicle(vehicle) {
    const confirmed = window.confirm(`Are you sure you want to delete ${vehicle.name}?`);
    if (!confirmed) return;

    setError("");

    try {
      const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicle.firebaseId);

      await runTransaction(db, async (transaction) => {
        const vehicleSnapshot = await transaction.get(vehicleRef);

        if (!vehicleSnapshot.exists()) {
          throw new Error("This vehicle no longer exists.");
        }

        const currentData = vehicleSnapshot.data();
        const assignedDriverId = currentData.driverId || "";
        const matchingDriver = drivers.find(
          (driver) => driver.vehicleId === vehicle.firebaseId
        );
        const driverIdToCheck = assignedDriverId || matchingDriver?.firebaseId || "";

        let assignedDriverRef = null;
        let assignedDriverData = null;

        if (driverIdToCheck) {
          assignedDriverRef = doc(db, DRIVERS_COLLECTION, driverIdToCheck);
          const driverSnapshot = await transaction.get(assignedDriverRef);

          if (driverSnapshot.exists()) {
            assignedDriverData = driverSnapshot.data();
          }
        }

        if (assignedDriverRef && assignedDriverData?.vehicleId === vehicle.firebaseId) {
          transaction.update(assignedDriverRef, {
            vehicleId: "",
            updatedAt: serverTimestamp(),
          });
        }

        transaction.delete(vehicleRef);
      });
    } catch (firebaseError) {
      console.error("Error deleting vehicle:", firebaseError);
      setError(
        firebaseError.message ||
          "Could not delete the vehicle. Check your Firestore rules."
      );
    }
  }

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.status === "Available"
  ).length;

  return (
    <div className="vehicles-page">
      <div className="vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>Manage your fleet and vehicle information.</p>
        </div>

        <button type="button" className="vehicles-add-btn" onClick={openAddVehicle}>
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      <div className="vehicles-stats">
        <div className="vehicles-stat-card">
          <span className="vehicles-stat-icon"><CarFront size={21} /></span>
          <div><p>Total Vehicles</p><h2>{vehicles.length}</h2></div>
        </div>

        <div className="vehicles-stat-card">
          <span className="vehicles-stat-icon"><RefreshCw size={21} /></span>
          <div><p>Available</p><h2>{availableCount}</h2></div>
        </div>
      </div>

      {error && <div className="vehicles-error">{error}</div>}

      <div className="vehicles-content">
        <div className="vehicles-content-header">
          <h2>All Vehicles</h2>
          <span>{vehicles.length} vehicles</span>
        </div>

        {loading ? (
          <div className="vehicles-empty">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="vehicles-empty">
            <CarFront size={38} />
            <h3>No vehicles added yet</h3>
            <p>Add your first vehicle to your MANZILL 777 fleet.</p>
            <button type="button" className="vehicles-add-btn" onClick={openAddVehicle}>
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
                  <th>One Way / km</th>
                  <th>Road Trip / km</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.firebaseId}>
                    <td>
                      <div className="vehicles-name-cell">
                        <VehicleThumbnail src={vehicle.image} name={vehicle.name} />
                        <div>
                          <strong>{vehicle.name}</strong>
                          <small>{vehicle.location}</small>
                        </div>
                      </div>
                    </td>
                    <td>{vehicle.number}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.driver || "Unassigned"}</td>
                    <td>₹{vehicle.oneWayPricePerKm}</td>
                    <td>₹{vehicle.roadTripPricePerKm}</td>
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

      {showForm && (
        <div
          className="vehicles-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
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
                <p>Vehicle information will be saved to Firebase.</p>
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
                  <select name="type" value={vehicleForm.type} onChange={updateField} required>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Premium">Premium</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MUV">MUV</option>
                  </select>
                </label>

                <label className="vehicles-form-group">
                  <span>Status *</span>
                  <select name="status" value={vehicleForm.status} onChange={updateField} required>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>

                <label className="vehicles-form-group vehicles-form-full">
                  <span>Assigned Driver</span>
                  <select
                    name="driverId"
                    value={vehicleForm.driverId}
                    onChange={handleDriverSelection}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((driver) => (
                      <option key={driver.firebaseId} value={driver.firebaseId}>
                        {driver.name} ({driver.id})
                      </option>
                    ))}
                  </select>
                  <small>Select the driver you want to assign to this vehicle.</small>
                </label>

                <label className="vehicles-form-group">
                  <span><IndianRupee size={15} /> One Way Price per km *</span>
                  <input
                    name="oneWayPricePerKm"
                    type="number"
                    min="0"
                    step="0.5"
                    value={vehicleForm.oneWayPricePerKm}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span><IndianRupee size={15} /> Road Trip Price per km *</span>
                  <input
                    name="roadTripPricePerKm"
                    type="number"
                    min="0"
                    step="0.5"
                    value={vehicleForm.roadTripPricePerKm}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className="vehicles-form-group">
                  <span><Users size={15} /> Passenger Capacity</span>
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
                  <span><BriefcaseBusiness size={15} /> Luggage Capacity</span>
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
                  <span><MapPin size={15} /> Current Location *</span>
                  <input
                    name="location"
                    value={vehicleForm.location}
                    onChange={updateField}
                    placeholder="e.g. Phagwara"
                    required
                  />
                </label>

                <label className="vehicles-form-group vehicles-form-full">
                  <span><ImageIcon size={15} /> Vehicle Image URL</span>
                  <input
                    name="image"
                    type="url"
                    value={vehicleForm.image}
                    onChange={updateField}
                    placeholder="https://example.com/vehicle.jpg"
                  />
                  <small>Use a publicly accessible direct image URL.</small>
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

              {error && <div className="vehicles-error vehicles-form-error">{error}</div>}

              <div className="vehicles-form-actions">
                <button
                  type="button"
                  className="vehicles-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="vehicles-save-btn" disabled={saving}>
                  {saving ? "Saving..." : editingVehicle ? "Update Vehicle" : "Save Vehicle"}
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
