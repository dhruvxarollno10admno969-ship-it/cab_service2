import React, { useState } from "react";
import "../styles/Drivers.css";

const initialDrivers = [
  {
    id: "DRV-001",
    name: "Raj Kumar",
    email: "raj.kumar@gmail.com",
    phone: "+91 98765 43210",
    vehicle: "Swift Dzire",
    vehicleNumber: "PB-08-AB-1234",
    status: "Active",
    joined: "12 September 2026",
  },
  {
    id: "DRV-002",
    name: "Aman Sharma",
    email: "aman.sharma@gmail.com",
    phone: "+91 98123 45678",
    vehicle: "Toyota Etios",
    vehicleNumber: "PB-09-CD-5678",
    status: "Active",
    joined: "10 September 2026",
  },
  {
    id: "DRV-003",
    name: "Gurpreet Singh",
    email: "gurpreet@gmail.com",
    phone: "+91 99887 66554",
    vehicle: "Hyundai Aura",
    vehicleNumber: "PB-10-EF-9012",
    status: "Inactive",
    joined: "05 September 2026",
  },
  {
    id: "DRV-004",
    name: "Arjun Verma",
    email: "arjun.verma@gmail.com",
    phone: "+91 97654 32109",
    vehicle: "Maruti Ertiga",
    vehicleNumber: "PB-07-GH-3456",
    status: "Active",
    joined: "01 September 2026",
  },
];

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);

  const filteredDrivers = drivers.filter((driver) => {
    const query = search.toLowerCase();

    return (
      driver.name.toLowerCase().includes(query) ||
      driver.id.toLowerCase().includes(query) ||
      driver.email.toLowerCase().includes(query) ||
      driver.phone.toLowerCase().includes(query) ||
      driver.vehicle.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleDelete = () => {
    if (!driverToDelete) return;

    setDrivers((currentDrivers) =>
      currentDrivers.filter(
        (driver) => driver.id !== driverToDelete.id
      )
    );

    if (selectedDriver?.id === driverToDelete.id) {
      setSelectedDriver(null);
    }

    setDriverToDelete(null);
  };

  return (
    <div className="driver-content">

      {/* =========================
          HEADER
      ========================= */}

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
          <strong>{drivers.length}</strong>
        </div>

      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="driver-tools">

        <div className="driver-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="driver-table-card">

        <div className="driver-table-scroll">

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
                        Try searching with a different name or ID.
                      </span>
                    </div>
                  </td>
                </tr>

              ) : (

                filteredDrivers.map((driver) => (

                  <tr
                    key={driver.id}
                    className="driver-row"
                    onClick={() => setSelectedDriver(driver)}
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
                          <strong>{driver.name}</strong>
                          <span>Driver</span>
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
                        <strong>{driver.vehicle}</strong>
                        <span>{driver.vehicleNumber}</span>
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
                        onClick={(e) => e.stopPropagation()}
                      >

                        <button
                          className="driver-edit-btn"
                          onClick={() =>
                            setSelectedDriver(driver)
                          }
                        >
                          View
                        </button>

                        <button
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

        </div>

        <div className="driver-table-footer">
          Showing <strong>{filteredDrivers.length}</strong>{" "}
          of <strong>{drivers.length}</strong> drivers
        </div>

      </div>

      {/* =========================
          DRIVER SIDE DRAWER
      ========================= */}

      {selectedDriver && (

        <>
          <div
            className="driver-drawer-overlay"
            onClick={() => setSelectedDriver(null)}
          ></div>

          <aside className="driver-drawer drawer-open">

            <div className="drawer-header">

              <div>
                <span>DRIVER DETAILS</span>
                <h2>Driver Profile</h2>
              </div>

              <button
                className="drawer-close"
                onClick={() => setSelectedDriver(null)}
              >
                ×
              </button>

            </div>

            <div className="drawer-profile">

              <div className="drawer-avatar">
                {getInitials(selectedDriver.name)}
              </div>

              <h3>{selectedDriver.name}</h3>

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

            <div className="drawer-section">

              <h4>Contact Information</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Email</span>
                  <strong>{selectedDriver.email}</strong>
                </div>

                <div className="drawer-info-item">
                  <span>Phone</span>
                  <strong>{selectedDriver.phone}</strong>
                </div>

              </div>

            </div>

            <div className="drawer-section">

              <h4>Vehicle Information</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Vehicle</span>
                  <strong>{selectedDriver.vehicle}</strong>
                </div>

                <div className="drawer-info-item">
                  <span>Vehicle Number</span>
                  <strong>{selectedDriver.vehicleNumber}</strong>
                </div>

              </div>

            </div>

            <div className="drawer-section">

              <h4>Account Information</h4>

              <div className="drawer-info">

                <div className="drawer-info-item">
                  <span>Driver ID</span>
                  <strong>{selectedDriver.id}</strong>
                </div>

                <div className="drawer-info-item">
                  <span>Joined</span>
                  <strong>{selectedDriver.joined}</strong>
                </div>

              </div>

            </div>

            <div className="drawer-actions">

              <button className="drawer-edit-btn">
                Edit Driver
              </button>

              <button
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

      {/* =========================
          DELETE MODAL
      ========================= */}

      {driverToDelete && (

        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-icon">
              !
            </div>

            <h3>Remove Driver?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{driverToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                className="cancel-delete"
                onClick={() => setDriverToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={handleDelete}
              >
                Remove Driver
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminDrivers;