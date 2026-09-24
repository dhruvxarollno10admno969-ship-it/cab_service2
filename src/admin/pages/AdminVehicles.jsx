import { useState } from "react";
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

import "../styles/vehicles.css";

function AdminVehicles() {
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [vehicles, setVehicles] = useState([
    {
      id: "VEH-001",
      name: "Swift Dzire",
      number: "PB-36-A-1234",
      type: "Sedan",
      driver: "Rahul Sharma",
      status: "Available",
      location: "Phagwara",
    },
    {
      id: "VEH-002",
      name: "Toyota Innova",
      number: "PB-37-B-4521",
      type: "SUV",
      driver: "Aman Kumar",
      status: "On Trip",
      location: "Jalandhar",
    },
    {
      id: "VEH-003",
      name: "Hyundai Verna",
      number: "PB-08-C-7823",
      type: "Sedan",
      driver: "Simran Kaur",
      status: "Available",
      location: "Ludhiana",
    },
    {
      id: "VEH-004",
      name: "Toyota Fortuner",
      number: "PB-10-D-9211",
      type: "Premium",
      driver: "Arjun Singh",
      status: "Maintenance",
      location: "Jalandhar",
    },
    {
      id: "VEH-005",
      name: "Kia Carens",
      number: "PB-09-E-6642",
      type: "Premium",
      driver: "Neha Verma",
      status: "Available",
      location: "Phagwara",
    },
  ]);

  // SEARCH
  const filteredVehicles = vehicles.filter((vehicle) => {
    const value = search.toLowerCase();

    return (
      vehicle.id.toLowerCase().includes(value) ||
      vehicle.name.toLowerCase().includes(value) ||
      vehicle.number.toLowerCase().includes(value) ||
      vehicle.driver.toLowerCase().includes(value) ||
      vehicle.type.toLowerCase().includes(value)
    );
  });

  // DELETE
  const deleteVehicle = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this vehicle?"
    );

    if (!confirmDelete) return;

    setVehicles((prev) =>
      prev.filter((vehicle) => vehicle.id !== id)
    );

    if (selectedVehicle?.id === id) {
      setSelectedVehicle(null);
    }
  };

  // STATUS ICON
  const getStatusIcon = (status) => {
    if (status === "Available") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Maintenance") {
      return <Wrench size={14} />;
    }

    return <Car size={14} />;
  };

  return (
    <div className="vehicles-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="vehicles-header">

        <div>
          <span className="vehicles-eyebrow">
            FLEET MANAGEMENT
          </span>

          <h1>Vehicles</h1>

          <p>
            Manage and monitor all vehicles in your fleet.
          </p>
        </div>

        <div className="vehicles-total-card">
          <span>Total Vehicles</span>
          <strong>{vehicles.length}</strong>
        </div>

      </div>


      {/* =====================================
          TOOLBAR
      ===================================== */}

      <div className="vehicles-toolbar">

        <div className="vehicles-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by vehicle, number, driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}

        </div>

      </div>


      {/* =====================================
          VEHICLES TABLE
      ===================================== */}

      <div className="vehicles-card">

        <div className="vehicles-table-wrapper">

          <table className="vehicles-table">

            <thead>
              <tr>
                <th>VEHICLE ID</th>
                <th>VEHICLE</th>
                <th>NUMBER</th>
                <th>TYPE</th>
                <th>DRIVER</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {filteredVehicles.length > 0 ? (

                filteredVehicles.map((vehicle) => (

                  <tr
                    key={vehicle.id}
                    onClick={() =>
                      setSelectedVehicle(vehicle)
                    }
                    className="vehicle-row"
                  >

                    {/* ID */}
                    <td>
                      <span className="vehicle-id">
                        {vehicle.id}
                      </span>
                    </td>


                    {/* VEHICLE */}
                    <td>

                      <div className="vehicle-name">

                        <div className="vehicle-icon">
                          <Car size={18} />
                        </div>

                        <div>
                          <strong>{vehicle.name}</strong>
                          <span>{vehicle.location}</span>
                        </div>

                      </div>

                    </td>


                    {/* NUMBER */}
                    <td>
                      <span className="vehicle-number">
                        {vehicle.number}
                      </span>
                    </td>


                    {/* TYPE */}
                    <td>
                      <span className="vehicle-type">
                        {vehicle.type}
                      </span>
                    </td>


                    {/* DRIVER */}
                    <td>
                      <span className="vehicle-driver">
                        {vehicle.driver}
                      </span>
                    </td>


                    {/* STATUS */}
                    <td>

                      <span
                        className={`vehicle-status ${vehicle.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {getStatusIcon(vehicle.status)}
                        {vehicle.status}
                      </span>

                    </td>


                    {/* ACTIONS */}
                    <td>

                      <div
                        className="vehicle-actions"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <button
                          className="vehicle-action-btn"
                          title="Edit vehicle"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="vehicle-action-btn vehicle-delete-btn"
                          title="Delete vehicle"
                          onClick={() =>
                            deleteVehicle(vehicle.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>

                        <button
                          className="vehicle-action-btn"
                          title="More"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

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
                      Try changing your search.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

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


      {/* =====================================
          RIGHT SIDE DETAILS PANEL
      ===================================== */}

      {selectedVehicle && (

        <>

          <div
            className="vehicle-panel-overlay"
            onClick={() => setSelectedVehicle(null)}
          />

          <aside className="vehicle-details-panel">

            <div className="vehicle-panel-header">

              <div>
                <span>VEHICLE DETAILS</span>
                <h2>{selectedVehicle.name}</h2>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
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
                <h3>{selectedVehicle.name}</h3>

                <span>
                  {selectedVehicle.id}
                </span>
              </div>

            </div>


            {/* DETAILS */}

            <div className="vehicle-details-list">

              <div>
                <span>Vehicle Number</span>
                <strong>
                  {selectedVehicle.number}
                </strong>
              </div>

              <div>
                <span>Vehicle Type</span>
                <strong>
                  {selectedVehicle.type}
                </strong>
              </div>

              <div>
                <span>Assigned Driver</span>
                <strong>
                  {selectedVehicle.driver}
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong className="vehicle-location">
                  <MapPin size={15} />
                  {selectedVehicle.location}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  <span
                    className={`vehicle-status ${selectedVehicle.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
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

              <button className="vehicle-edit-full">
                <Pencil size={16} />
                Edit Vehicle
              </button>

              <button
                className="vehicle-remove-full"
                onClick={() =>
                  deleteVehicle(selectedVehicle.id)
                }
              >
                <Trash2 size={16} />
                Remove Vehicle
              </button>

            </div>

          </aside>

        </>

      )}

    </div>
  );
}

export default AdminVehicles;