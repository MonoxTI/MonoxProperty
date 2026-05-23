// src/Nav.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.tsx';

const Navigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const close = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/home" onClick={close}>
          🏠 Monokoane Property
        </Link>

        {/* Mobile Toggle — controlled by React state */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className={`navbar-collapse ${isOpen ? 'show' : 'collapse'}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home" onClick={close}>Home</Link>
            </li>

            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={close}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={close}>Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/Property" onClick={close}>Properties</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/Lease" onClick={close}>Leases</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/Tenant" onClick={close}>Tenants</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/deleteExpense" onClick={close}>Expenses</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reports" onClick={close}>Reports</Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => { handleLogout(); close(); }}
                    className="btn btn-outline-light btn-sm ms-2 mt-1 mt-lg-0"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;