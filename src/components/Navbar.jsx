import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <a href="#home" className="logo">
        <span className="logo-mark">M</span>
        <span>MANZILL 777</span>
      </a>

      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#fleet">Fleet</a>
        <a href="#contact">Contact</a>
      </div>

      <button className="menu-button" type="button">
        <Menu size={24} />
      </button>
    </nav>
  );
};

export default Navbar;