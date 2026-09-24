import React, { useState } from "react";
import "../styles/customers.css";

const initialCustomers = [
  {
    id: "CUS-001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    status: "Active",
    joined: "12 September 2026",
  },
  {
    id: "CUS-002",
    name: "Simran Kaur",
    email: "simran@gmail.com",
    phone: "+91 98765 12345",
    status: "Active",
    joined: "10 September 2026",
  },
  {
    id: "CUS-003",
    name: "Arjun Singh",
    email: "arjun@gmail.com",
    phone: "+91 99887 66554",
    status: "Inactive",
    joined: "05 September 2026",
  },
  {
    id: "CUS-004",
    name: "Neha Verma",
    email: "neha@gmail.com",
    phone: "+91 98712 34567",
    status: "Active",
    joined: "01 September 2026",
  },
  {
    id: "CUS-005",
    name: "Aman Kumar",
    email: "aman@gmail.com",
    phone: "+91 98123 45678",
    status: "Inactive",
    joined: "28 August 2026",
  },
];

const Customer = () => {
  const [customers, setCustomers] = useState(initialCustomers);

  const [search, setSearch] = useState("");

  // Selected customer for drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Delete confirmation
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase();

    return (
      customer.id.toLowerCase().includes(searchValue) ||
      customer.name.toLowerCase().includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue) ||
      customer.phone.toLowerCase().includes(searchValue)
    );
  });

  // Open customer drawer
  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  // Close drawer
  const closeDrawer = () => {
    setSelectedCustomer(null);
  };

  // Ask for delete confirmation
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
  };

  // Delete customer
  const confirmDelete = () => {
    if (!customerToDelete) return;

    setCustomers((previousCustomers) =>
      previousCustomers.filter(
        (customer) => customer.id !== customerToDelete.id
      )
    );

    // Close drawer if deleted customer is currently open
    if (selectedCustomer?.id === customerToDelete.id) {
      setSelectedCustomer(null);
    }

    setCustomerToDelete(null);
  };

  // Edit customer
  const handleEdit = (customer) => {
    console.log("Edit customer:", customer);

    // Add your edit modal/form here later.
  };

  return (
    <>
      <div className="customer-content">
        {/* =================================
            PAGE HEADER
        ================================= */}
        <div className="customer-page-header">
          <div>
            <span className="customer-page-label">
              CUSTOMER MANAGEMENT
            </span>

            <h1>Customers</h1>

            <p>
              View and manage all registered customers.
            </p>
          </div>

          <div className="customer-total">
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>
        </div>

        {/* =================================
            SEARCH
        ================================= */}
        <div className="customer-tools">
          <div className="customer-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* =================================
            CUSTOMER TABLE
        ================================= */}
        <div className="customer-table-card">
          <div className="customer-table-scroll">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => handleCustomerClick(customer)}
                      className="customer-row"
                    >
                      {/* ID */}
                      <td>
                        <span className="customer-id">
                          {customer.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="customer-user">
                          <div className="customer-avatar">
                            {customer.name.charAt(0)}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>

                            <span>Customer</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="customer-email">
                          {customer.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td>
                        <span className="customer-phone">
                          {customer.phone}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`customer-status ${
                            customer.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <i></i>

                          {customer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="customer-actions">
                          <button
                            className="customer-edit-btn"
                            onClick={() =>
                              handleEdit(customer)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="customer-delete-btn"
                            onClick={() =>
                              handleDeleteClick(customer)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="customer-empty"
                    >
                      <div>
                        <strong>No customers found</strong>

                        <span>
                          Try changing your search.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="customer-table-footer">
            Showing{" "}
            <strong>{filteredCustomers.length}</strong>{" "}
            of{" "}
            <strong>{customers.length}</strong> customers
          </div>
        </div>
      </div>

      {/* =================================
          OVERLAY
      ================================= */}
      {selectedCustomer && (
        <div
          className="customer-drawer-overlay"
          onClick={closeDrawer}
        ></div>
      )}

      {/* =================================
          CUSTOMER DRAWER
      ================================= */}
      <aside
        className={`customer-drawer ${
          selectedCustomer ? "drawer-open" : ""
        }`}
      >
        {selectedCustomer && (
          <>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div>
                <span>Customer Details</span>
                <h2>Customer Profile</h2>
              </div>

              <button
                className="drawer-close"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            {/* Profile */}
            <div className="drawer-profile">
              <div className="drawer-avatar">
                {selectedCustomer.name.charAt(0)}
              </div>

              <h3>{selectedCustomer.name}</h3>

              <span className="drawer-customer-id">
                {selectedCustomer.id}
              </span>

              <span
                className={`customer-status drawer-status ${
                  selectedCustomer.status === "Active"
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                <i></i>

                {selectedCustomer.status}
              </span>
            </div>

            {/* Contact Information */}
            <div className="drawer-section">
              <h4>Contact Information</h4>

              <div className="drawer-info">
                <div className="drawer-info-item">
                  <span>Email</span>

                  <strong>
                    {selectedCustomer.email}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Phone Number</span>

                  <strong>
                    {selectedCustomer.phone}
                  </strong>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="drawer-section">
              <h4>Account Information</h4>

              <div className="drawer-info">
                <div className="drawer-info-item">
                  <span>Customer ID</span>

                  <strong>
                    {selectedCustomer.id}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Joined</span>

                  <strong>
                    {selectedCustomer.joined}
                  </strong>
                </div>

                <div className="drawer-info-item">
                  <span>Account Status</span>

                  <strong>
                    {selectedCustomer.status}
                  </strong>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="drawer-actions">
              <button
                className="drawer-edit-btn"
                onClick={() =>
                  handleEdit(selectedCustomer)
                }
              >
                Edit Customer
              </button>

              <button
                className="drawer-delete-btn"
                onClick={() =>
                  handleDeleteClick(selectedCustomer)
                }
              >
                Remove Customer
              </button>
            </div>
          </>
        )}
      </aside>

      {/* =================================
          DELETE CONFIRMATION
      ================================= */}
      {customerToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">
              !
            </div>

            <h3>Remove Customer?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>
                {customerToDelete.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete"
                onClick={() =>
                  setCustomerToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={confirmDelete}
              >
                Remove Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Customer;