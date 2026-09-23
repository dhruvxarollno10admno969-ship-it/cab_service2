import { Routes, Route, Outlet } from "react-router-dom";

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

import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminBooking from "./admin/pages/AdminBooking";


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

      {/* ==================================
          CUSTOMER WEBSITE
      ================================== */}

      <Route element={<CustomerLayout />}>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MAIN PAGES */}
        <Route path="/services" element={<Service />} />
        <Route path="/about" element={<About />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/contact" element={<Contact />} />


        {/* ==================================
            PROTECTED CUSTOMER PAGES
        ================================== */}

        <Route element={<PrivateRoute />}>

          <Route
            path="/booking"
            element={<Booking />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Setting />}
          />

        </Route>

      </Route>


   {/* ==================================
    ADMIN PANEL
================================== */}

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
      

    </Routes>
  );
}

export default App;