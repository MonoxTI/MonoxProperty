// src/components/Navigation.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.tsx';

const Navigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/home">
          🏠 Monokoane Property
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Home - Always visible */}
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>

            {/* Guest Links (Not Logged In) */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Property Management */}
                <li className="nav-item">
                  <Link
                    className="nav-link" to="/Property">
                    Properties
                    </Link>
                </li>

                {/* Leases */}
                <li className="nav-item">
                 <Link className="nav-link" to="/Lease">
                 Leases
                 </Link>
                </li>

                {/* Tenants */}
                <li className="nav-item">
                  <Link className="nav-link" to="/Tenant">
                    Tenants
                  </Link>
                </li>

                {/* Expenses */}
                <li className="nav-item">
                  <Link className="nav-link" to="/deleteExpense">
                    Expense
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reports">
                  Reports
                  </Link>
                </li>

                {/* Logout */}
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm ms-2"
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