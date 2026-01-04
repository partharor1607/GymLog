import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand gymlog-logo">
          <span className="gymlog-icon">🏋️</span>
          <span className="gymlog-text">
            <span className="gymlog-gym">GYM</span>
            <span className="gymlog-log">LOG</span>
          </span>
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/workouts">Workouts</Link>
          <Link to="/reports">Reports</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

