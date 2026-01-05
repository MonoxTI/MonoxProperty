// src/components/GetTenant.tsx
import React, { useState } from 'react';

interface Tenant {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

const GetTenant: React.FC = () => {
  const [tenantId, setTenantId] = useState<string>('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const id = Number(tenantId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid tenant ID (number > 0)');
      return;
    }

    setLoading(true);
    setError(null);
    setTenant(null);

    try {
      // Get JWT token if exists
      const token = localStorage.getItem('tenant');
      const headers = token 
        ? { Authorization: `Bearer ${token}` } 
        : {};

      const response = await fetch(`http://localhost:5153/api/tenant/${id}`, { headers });
      
      if (response.status === 404) {
        throw new Error('Tenant not found');
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const  Tenant = await response.json();
      setTenant(data);
    } catch (err: any) {
      console.error('Tenant fetch error:', err);
      setError(err.message || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
              className="bi bi-search me-2" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            Find Tenant by ID
          </h2>
        </div>
        <div className="card-body">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="Enter tenant ID (e.g., 1, 5, 12)"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                min="1"
                required
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Searching...
                  </>
                ) : (
                  'Search Tenant'
                )}
              </button>
            </div>
            <div className="form-text">
              Enter the tenant ID to view details
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <div className="d-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" 
                  className="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
                  <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06A.129.129 0 0 1 15 13.999a.135.135 0 0 1-.002-.017-.145.145 0 0 1-.023-.036.148.148 0 0 1-.024-.037c-.054-.116-.116-.224-.184-.327a.17.17 0 0 1-.002-.184l.001-.002z"/>
                  <path d="M8 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
                <div>{error}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Tenant Details */}
          {tenant && (
            <div className="mt-4">
              <h3 className="mb-3 text-center">Tenant Details</h3>
              <div className="card">
                <div className="card-body">
                  <div className="text-center mb-3">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                      style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                      {tenant.fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>ID:</strong>
                        <span className="text-primary">#{tenant.id}</span>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Full Name:</strong>
                        <span>{tenant.fullName}</span>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Email:</strong>
                        <a href={`mailto:${tenant.email}`} className="text-decoration-none">
                          {tenant.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Phone:</strong>
                        <a href={`tel:${tenant.phoneNumber}`} className="text-decoration-none">
                          {tenant.phoneNumber}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-center text-muted small">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
            className="bi bi-info-circle me-1" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8.93 6.588l-2.29.924L5.38 5.24a1 1 0 0 1 1.414-1.414l1.82 1.819 1.82-1.82a1 1 0 0 1 1.414 1.414L10.686 6.5l-1.756.702z"/>
            <path d="M8.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          Click email/phone to contact tenant directly
        </p>
      </div>
    </div>
  );
};

export default GetTenant;