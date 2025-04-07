import React from "react";
import "./Navbar.css"; // CSS dosyasını dahil ediyoruz


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">BiblioSphere</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
