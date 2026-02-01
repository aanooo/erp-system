import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>⚡ ERP Pro</h2>
      </div>
      <ul className="nav-menu">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/customers">Customers</Link></li>
        <li><Link to="/suppliers">Suppliers</Link></li>
        <li><Link to="/orders">Orders</Link></li>
      </ul>
      <div className="nav-user">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <span className="user-name">{user.name}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;