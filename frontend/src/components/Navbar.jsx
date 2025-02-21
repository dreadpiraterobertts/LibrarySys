import React from "react";
import './navbar.css'
import whlogo from '../assets/whlogo.png'
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {

  const location = useLocation()
  return (
    <nav className="navbar">
     <img src={whlogo} className="navbar-logo" alt="" />
      <h1 className="navbar-title">World Harvest Theology College</h1>
      <div className="navbar-buttons">
        <Link style={{textDecoration:'none',color:'white'}} to='/'><button className={location.pathname === "/" ? "active" : ""}> Dashboard</button></Link>
        <Link style={{textDecoration:'none', color:'white'}} to='/loan'><button className={location.pathname === "/loan" ? "active" : ""}>Loan Management</button></Link>
        <Link style={{textDecoration:'none',color:'white'}} to='/book'><button className={location.pathname === "/book" ? "active" : ""}> Book Management</button></Link>
        <Link style={{textDecoration:'none', color:'white'}} to='/user'><button className={location.pathname === "/user" ? "active" : ""}>User Management</button></Link>
      </div>
    </nav>
  );
};

export default Navbar;
