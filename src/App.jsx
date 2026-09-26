import { Routes, Route, Outlet } from "react-router-dom";

// ========================================
// CUSTOMER WEBSITE PAGES
// ========================================

import Home from "./pages/Home";
import Service from "./components/Service";
import About from "./pages/booking/about/About";
import Fleet from "./pages/Fleet";
import Contact from "./pages/Contact";
import Booking from "./pages/booking/Booking";

import Login from "./pages/Authentication/Login";
import Signup from "./pages/Authentication/Signup";

import Profile from "./pages/profile";
import Setting from "./pages/Setting";

import PrivateRoute from "./PrivateRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ========================================
// ADMIN PANEL
// ========================================
import AdminPrivateRoute from "./admin/AdminPrivateRoute";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminBooking from "./admin/pages/AdminBooking";
import Customer from "./admin/pages/AdminCustomers";
import Drivers from "./admin/pages/AdminDriver";
import Vehicles from "./admin/pages/AdminVehicles";
import Pricing from "./admin/pages/AdminPricing";
import NotFound from "./admin/pages/NotFound";

// ========================================
// CUSTOMER WEBSITE LAYOUT
// ========================================

function CustomerLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

// ========================================
// APP
// ========================================

function App() {
  return (
    <Routes>
      {/* ========================================
          CUSTOMER WEBSITE
      ======================================== */}

      <Route element={<CustomerLayout />}>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* MAIN PAGES */}
        <Route path="/services" element={<Service />} />

        <Route path="/about" element={<About />} />

        <Route path="/fleet" element={<Fleet />} />

        <Route path="/contact" element={<Contact />} />

        {/* ========================================
            PROTECTED CUSTOMER PAGES
        ======================================== */}

        <Route element={<PrivateRoute />}>
          <Route path="/booking" element={<Booking />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Setting />} />
        </Route>
      </Route>

      {/* ========================================
          ADMIN PANEL
      ======================================== */}
      {/* ========================================
    ADMIN LOGIN - PUBLIC
======================================== */}

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ========================================
    ADMIN PANEL - PRIVATE
======================================== */}

      <Route element={<AdminPrivateRoute />}>
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminLayout>
              <AdminBooking />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <AdminLayout>
              <Customer />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/drivers"
          element={
            <AdminLayout>
              <Drivers />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/vehicles"
          element={
            <AdminLayout>
              <Vehicles />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/pricing"
          element={
            <AdminLayout>
              <Pricing />
            </AdminLayout>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
