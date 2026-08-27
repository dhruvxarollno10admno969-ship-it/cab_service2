import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Fleet from "./pages/Fleet";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* MAIN PAGES */}
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/contact" element={<Contact />} />

      {/* BOOKING */}
      <Route path="/booking" element={<Booking />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    </Routes>
  );
}

export default App;