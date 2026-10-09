
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
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
      return {
        pricePerKm: "16",
        passengers: "6",
        luggage: "4",
      };

    case "Premium":
      return {
        pricePerKm: "22",
        passengers: "4",
        luggage: "3",
      };

    case "Hatchback":
      return {
        pricePerKm: "10",
        passengers: "4",
        luggage: "2",
      };

    case "MUV":
      return {
        pricePerKm: "18",
        passengers: "7",
        luggage: "4",
      };

    default:
      return {
        pricePerKm: "12",
        passengers: "4",
        luggage: "2",
      };
  }
}

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_FORM);

  // Listen for live vehicle updates from Firestore.
  useEffect(() => {
    const vehiclesRef = collection(db, VEHICLES_COLLECTION);

    const unsubscribe = onSnapshot(
      vehiclesRef,
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
            pricePerKm: Number(data.pricePerKm ?? defaults.pricePerKm),
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
        setError(
          "Unable to load vehicles. Check your Firebase connection and Firestore rules."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setVehicleForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      // Use sensible defaults when the vehicle type changes.
      if (name === "type") {
        const defaults = getDefaultsByType(value);

        updated.pricePerKm = defaults.pricePerKm;
        updated.passengers = defaults.passengers;
        updated.luggage = defaults.luggage;
      }

      return updated;
    });
  }

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEditVehicle(vehicle) {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      number: vehicle.number,
      type: vehicle.type,
      driverId: vehicle.driverId,
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

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingVehicle(null);
    setVehicleForm(EMPTY_FORM);
    setError("");
  }

  async function saveVehicle(event) {
    event.preventDefault();
    setError("");

    const name = vehicleForm.name.trim();
    const number = vehicleForm.number.trim();
    const location = vehicleForm.location.trim();
    const pricePerKm = Number(vehicleForm.pricePerKm);
    const passengers = Number(vehicleForm.passengers);
    const luggage = Number(vehicleForm.luggage);

    if (!name || !number || !location) {
      setError("Please enter the vehicle name, registration number and location.");
      return;
    }

    if (
      !Number.isFinite(pricePerKm) ||
      pricePerKm < 0 ||
      !Number.isFinite(passengers) ||
      passengers < 1 ||
      !Number.isFinite(luggage) ||
      luggage < 0
    ) {
      setError("Enter a valid price, passenger capacity and luggage capacity.");
      return;
    }

    const vehicleData = {
      name,
      number,
      type: vehicleForm.type,
      driverId: vehicleForm.driverId.trim(),
      driver: vehicleForm.driver.trim() || "Unassigned",
      status: vehicleForm.status,
      location,
      image: vehicleForm.image.trim(),
      description: vehicleForm.description.trim(),
      pricePerKm,
      passengers,
      luggage,
      updatedAt: serverTimestamp(),
    };

    setSaving(true);

    try {
      if (editingVehicle) {
        await updateDoc(
          doc(db, VEHICLES_COLLECTION, editingVehicle.firebaseId),
          vehicleData
        );
      } else {
        await addDoc(collection(db, VEHICLES_COLLECTION), {
          ...vehicleData,
          createdAt: serverTimestamp(),
        });
      }

      setShowForm(false);
      setEditingVehicle(null);
      setVehicleForm(EMPTY_FORM);
    } catch (firebaseError) {
      console.error("Error saving vehicle:", firebaseError);
      setError(
        "Could not save the vehicle. Check your Firebase connection and Firestore rules."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeVehicle(vehicle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicle.firebaseId));
    } catch (firebaseError) {
      console.error("Error deleting vehicle:", firebaseError);
      setError("Could not delete the vehicle. Check your Firestore rules.");
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

        <button
          type="button"
          className="vehicles-add-btn"
          onClick={openAddVehicle}
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

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
                        {vehicle.image ? (
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="vehicles-thumbnail"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="vehicles-thumbnail-placeholder">
                            <CarFront size={21} />
                          </span>
                        )}

                        <div>
                          <strong>{vehicle.name}</strong>
                          <small>{vehicle.location}</small>
                        </div>
                      </div>
                    </td>

                    <td>{vehicle.number}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.driver}</td>
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

      {showForm && (
        <div className="vehicles-modal-overlay">
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

                <label className="vehicles-form-group">
                  <span>Assigned Driver</span>
                  <input
                    name="driver"
                    value={vehicleForm.driver}
                    onChange={updateField}
                    placeholder="Driver name or Unassigned"
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>Driver ID (optional)</span>
                  <input
                    name="driverId"
                    value={vehicleForm.driverId}
                    onChange={updateField}
                    placeholder="Driver document ID"
                  />
                </label>

                <label className="vehicles-form-group">
                  <span>
                    <IndianRupee size={15} /> Price per kilometre
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
                    <Users size={15} /> Passenger Capacity
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
                    <BriefcaseBusiness size={15} /> Luggage Capacity
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
                    <MapPin size={15} /> Current Location *
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
                    <ImageIcon size={15} /> Vehicle Image URL
                  </span>
                  <input
                    name="image"
                    type="url"
                    value={vehicleForm.image}
                    onChange={updateField}
                    placeholder="https://example.com/vehicle.jpg"
                  />
                  <small>
                    Use a publicly accessible image URL.
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

              {error && <div className="vehicles-error">{error}</div>}

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

