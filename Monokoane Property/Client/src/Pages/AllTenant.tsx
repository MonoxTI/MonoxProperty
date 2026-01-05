// src/components/AllTenants.tsx
import React, { useState, useEffect } from 'react';

interface Tenant {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

const AllTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Get JWT token if exists
        const token = localStorage.getItem('token');
        const headers = token 
          ? { Authorization: `Bearer ${token}` } 
          : {};

        const response = await fetch('http://localhost:5153/api/tenant', { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to load tenants: ${response.status} ${response.statusText}`);
        }

        const  Tenant[] = await response.json();
        setTenants(data);
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        setError(err.message || 'Failed to load tenants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Simple cleanup: remove non-digits except +
    return phone.replace(/[^+\d]/g, '').replace(/(\d{3})(\d)/, '$1 $2');
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading tenants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
            className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <div>
            <h4 className="alert-heading">Error Loading Tenants</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline-danger btn-sm" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" 
            className="bi bi-people me-2" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h9Zm-7.978-1A.271.271 0 0 1 7 12.996c.001-.266.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.274.272h-.008Zm-4.688-2a1.99 1.99 0 0 0-.003-2A1.99 1.99 0 0 0 4 8a1.99 1.99 0 0 0-1.307 3.978h-.02Z"/>
          </svg>
          Property Tenants
        </h1>
        <span className="badge bg-primary fs-5">
          {tenants.length} {tenants.length === 1 ? 'Tenant' : 'Tenants'}
        </span>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" 
              className="bi bi-person-lines-fill mb-3" viewBox="0 0 16 16">
              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 0 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm-7-8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5z"/>
            </svg>
            <h3>No Tenants Found</h3>
            <p className="lead">Your tenant list is empty</p>
            <p className="text-muted">Add a new tenant to get started</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} className="align-middle">
                  <td className="fw-bold text-primary">#{tenant.id}</td>
                  <td>{tenant.fullName}</td>
                  <td>
                    <a href={`mailto:${tenant.email}`} className="text-decoration-none">
                      {tenant.email}
                    </a>
                  </td>
                  <td>
                    <a href={`tel:${tenant.phoneNumber}`} className="text-decoration-none">
                      {formatPhoneNumber(tenant.phoneNumber)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-muted small">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
            className="bi bi-info-circle me-1" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8.93 6.588l-2.29.924L5.38 5.24a1 1 0 0 1 1.414-1.414l1.82 1.819 1.82-1.82a1 1 0 0 1 1.414 1.414L10.686 6.5l-1.756.702z"/>
            <path d="M8.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          Click email/phone to contact tenants directly
        </p>
      </div>
    </div>
  );
};

export default AllTenants;