import React, { useEffect, useState } from "react";

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import {
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  User,
  CalendarDays,
  Globe,
  Map,
  Trash2,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { db } from "../../firebase";

import "../styles/customers.css";

// =====================================================
// CUSTOMER MANAGEMENT
// FIREBASE / FIRESTORE VERSION
// =====================================================

const Customer = () => {
  // ===================================================
  // STATE
  // ===================================================

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerToDelete, setCustomerToDelete] = useState(null);

  // ===================================================
  // FETCH CUSTOMERS FROM FIRESTORE
  // ===================================================

  useEffect(() => {
    setLoading(true);
    setError("");

    /*
      IMPORTANT:

      This assumes your Firestore collection is:

      users

      Example document:

      users
        └── X7SBKIfyelP6sYQv4VUtP7a8uKC2
              address
              city
              country
              email
              name
              phone
              state
              uid
    */

    const customersRef = collection(db, "users");

    /*
      We don't require createdAt because your current
      Firebase documents don't necessarily contain it.
    */

    const unsubscribe = onSnapshot(
      customersRef,

      (snapshot) => {
        const customerData = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: data.uid || doc.id,

            name: data.name || "Unknown Customer",

            email: data.email || "No email",

            phone: data.phone || "No phone",

            address: data.address || "Address not available",

            city: data.city || "",

            state: data.state || "",

            country: data.country || "",

            uid: data.uid || doc.id,

            status: data.status || "Active",

            joined: data.createdAt ? formatDate(data.createdAt) : "—",
          };
        });

        setCustomers(customerData);

        setLoading(false);
      },

      (firebaseError) => {
        console.error("Firestore customer fetch error:", firebaseError);

        setError("Unable to load customers from Firebase.");

        setLoading(false);
      },
    );

    // Cleanup Firestore listener
    return () => unsubscribe();
  }, []);

  // ===================================================
  // FORMAT FIREBASE DATE
  // ===================================================

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) {
        return "—";
      }

      // Firestore Timestamp
      if (dateValue?.toDate) {
        return dateValue.toDate().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      }

      // JavaScript Date
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "—";
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);

      return "—";
    }
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      customer.id?.toLowerCase().includes(searchValue) ||
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.email?.toLowerCase().includes(searchValue) ||
      customer.phone?.toLowerCase().includes(searchValue) ||
      customer.city?.toLowerCase().includes(searchValue) ||
      customer.state?.toLowerCase().includes(searchValue)
    );
  });

  // ===================================================
  // OPEN CUSTOMER
  // ===================================================

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  // ===================================================
  // CLOSE DRAWER
  // ===================================================

  const closeDrawer = () => {
    setSelectedCustomer(null);
  };

  // ===================================================
  // EDIT CUSTOMER
  // ===================================================

  const handleEdit = (customer) => {
    console.log("Edit customer:", customer);

    /*
      We can create a Firebase edit modal next.

      Example fields:

      name
      email
      phone
      address
      city
      state
      country
    */
  };

  // ===================================================
  // DELETE CUSTOMER
  // ===================================================

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
  };

  // ===================================================
  // CONFIRM DELETE
  // ===================================================

  const confirmDelete = () => {
    /*
      IMPORTANT:

      We are NOT deleting the Firebase account here.

      Firebase Authentication users and Firestore
      documents are separate.

      We'll implement secure admin-only deletion
      through backend/Admin SDK later.

      For now this just closes the confirmation.
    */

    console.log("Delete requested:", customerToDelete);

    setCustomerToDelete(null);
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="customer-content">
        <div className="customer-page-header">
          <div>
            <span className="customer-page-label">CUSTOMER MANAGEMENT</span>

            <h1>Customers</h1>

            <p>Loading customers from Firebase...</p>
          </div>

          <div className="customer-total">
            <span>Total Customers</span>

            <strong>...</strong>
          </div>
        </div>

        <div className="customer-table-card">
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#777",
            }}
          >
            <RefreshCw
              size={24}
              style={{
                animation: "spin 1s linear infinite",
                marginBottom: "10px",
              }}
            />

            <div>Loading customer data...</div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <>
      <div className="customer-content">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="customer-page-header">
          <div>
            <span className="customer-page-label">CUSTOMER MANAGEMENT</span>

            <h1>Customers</h1>

            <p>View and manage all registered customers.</p>
          </div>

          <div className="customer-total">
            <span>Total Customers</span>

            <strong>{customers.length}</strong>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff1f1",
              color: "#c62828",
              border: "1px solid #f0caca",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="customer-tools">
          <div className="customer-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search by name, ID, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* =================================================
            CUSTOMER TABLE
        ================================================= */}

        <div className="customer-table-card">
          <div className="customer-table-scroll">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer ID</th>

                  <th>Customer</th>

                  <th>Email</th>

                  <th>Phone</th>

                  <th>Location</th>

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
                      {/* =========================
                            ID
                        ========================= */}

                      <td>
                        <span className="customer-id">{customer.id}</span>
                      </td>

                      {/* =========================
                            CUSTOMER
                        ========================= */}

                      <td>
                        <div className="customer-user">
                          <div className="customer-avatar">
                            {customer.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>

                            <span>Customer</span>
                          </div>
                        </div>
                      </td>

                      {/* =========================
                            EMAIL
                        ========================= */}

                      <td>
                        <span className="customer-email">{customer.email}</span>
                      </td>

                      {/* =========================
                            PHONE
                        ========================= */}

                      <td>
                        <span className="customer-phone">{customer.phone}</span>
                      </td>

                      {/* =========================
                            LOCATION
                        ========================= */}

                      <td>
                        <span className="customer-phone">
                          {customer.city || customer.state || "—"}
                        </span>
                      </td>

                      {/* =========================
                            STATUS
                        ========================= */}

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

                      {/* =========================
                            ACTIONS
                        ========================= */}

                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="customer-actions">
                          <button
                            className="customer-edit-btn"
                            onClick={() => handleEdit(customer)}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            className="customer-delete-btn"
                            onClick={() => handleDeleteClick(customer)}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="customer-empty">
                      <div>
                        <strong>No customers found</strong>

                        <span>
                          {customers.length === 0
                            ? "No customers are registered in Firebase yet."
                            : "Try changing your search."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              TABLE FOOTER
          ================================================= */}

          <div className="customer-table-footer">
            Showing <strong>{filteredCustomers.length}</strong> of{" "}
            <strong>{customers.length}</strong> customers
          </div>
        </div>
      </div>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      {selectedCustomer && (
        <div className="customer-drawer-overlay" onClick={closeDrawer}></div>
      )}

      {/* =====================================================
          CUSTOMER DRAWER
      ===================================================== */}

      <aside
        className={`customer-drawer ${selectedCustomer ? "drawer-open" : ""}`}
      >
        {selectedCustomer && (
          <>
            {/* =================================================
                DRAWER HEADER
            ================================================= */}

            <div className="drawer-header">
              <div>
                <span>Customer Details</span>

                <h2>Customer Profile</h2>
              </div>

              <button className="drawer-close" onClick={closeDrawer}>
                <X size={20} />
              </button>
            </div>

            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="drawer-profile">
              <div className="drawer-avatar">
                {selectedCustomer.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <h3>{selectedCustomer.name}</h3>

              <span className="drawer-customer-id">{selectedCustomer.uid}</span>

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

            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="drawer-section">
              <h4>Contact Information</h4>

              <div className="drawer-info">
                {/* EMAIL */}

                <div className="drawer-info-item">
                  <span>
                    <Mail size={14} />
                    Email
                  </span>

                  <strong>{selectedCustomer.email}</strong>
                </div>

                {/* PHONE */}

                <div className="drawer-info-item">
                  <span>
                    <Phone size={14} />
                    Phone Number
                  </span>

                  <strong>{selectedCustomer.phone}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="drawer-section">
              <h4>Address</h4>

              <div className="drawer-info">
                {/* STREET ADDRESS */}

                <div className="drawer-info-item">
                  <span>
                    <MapPin size={14} />
                    Street Address
                  </span>

                  <strong>{selectedCustomer.address || "—"}</strong>
                </div>

                {/* CITY */}

                <div className="drawer-info-item">
                  <span>
                    <Map size={14} />
                    City
                  </span>

                  <strong>{selectedCustomer.city || "—"}</strong>
                </div>

                {/* STATE */}

                <div className="drawer-info-item">
                  <span>State</span>

                  <strong>{selectedCustomer.state || "—"}</strong>
                </div>

                {/* COUNTRY */}

                <div className="drawer-info-item">
                  <span>
                    <Globe size={14} />
                    Country
                  </span>

                  <strong>{selectedCustomer.country || "—"}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <div className="drawer-section">
              <h4>Account Information</h4>

              <div className="drawer-info">
                {/* UID */}

                <div className="drawer-info-item">
                  <span>Firebase UID</span>

                  <strong>{selectedCustomer.uid}</strong>
                </div>

                {/* STATUS */}

                <div className="drawer-info-item">
                  <span>Account Status</span>

                  <strong>{selectedCustomer.status}</strong>
                </div>

                {/* JOINED */}

                <div className="drawer-info-item">
                  <span>
                    <CalendarDays size={14} />
                    Joined
                  </span>

                  <strong>{selectedCustomer.joined}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="drawer-actions">
              <button
                className="drawer-edit-btn"
                onClick={() => handleEdit(selectedCustomer)}
              >
                <Pencil size={15} />
                Edit Customer
              </button>

              <button
                className="drawer-delete-btn"
                onClick={() => handleDeleteClick(selectedCustomer)}
              >
                <Trash2 size={15} />
                Remove Customer
              </button>
            </div>
          </>
        )}
      </aside>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {customerToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">!</div>

            <h3>Remove Customer?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{customerToDelete.name}</strong>
              ?
              <br />
              This action will require Firebase Admin permission.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete"
                onClick={() => setCustomerToDelete(null)}
              >
                Cancel
              </button>

              <button className="confirm-delete" onClick={confirmDelete}>
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
