import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Service from "./components/Service";
import About from "./pages/About";
import Fleet from "./pages/Fleet";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Login from "./pages/Authentication/Login";
import Signup from "./pages/Authentication/Signup";
import Profile from "./pages/profile";
import Setting from "./pages/Setting";
import PrivateRoute from "./PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
        <Navbar/>
    <Routes>
  
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

      <Route element={<PrivateRoute />}>
        {/* BOOKING */}
        <Route path="/booking" element={<Booking />} />

        {/* ACCOUNT */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Setting />} />
      </Route>
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
