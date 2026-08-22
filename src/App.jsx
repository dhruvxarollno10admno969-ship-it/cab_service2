import { Routes, Route } from "react-router-dom";
import "./App.css";
import { ArrowUpRight, MapPin, Menu } from "lucide-react";
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
    <Route path="/" element={<Home/>}/>

    <Route path="/services" element={<Services/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/fleet" element={<Fleet/>}/>
    <Route path="/contact" element={<Contact/>}/>

  <Route path="/booking" element={<Booking/>}/>

  <Route path="/Login" element={<Login/>}/>
  <Route path="/Signup" element={<Signup/>}/>
   </Routes>

  );
}

export default App;