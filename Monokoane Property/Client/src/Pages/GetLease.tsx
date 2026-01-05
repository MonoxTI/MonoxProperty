// src/components/GetLease.tsx
import React, { useState } from 'react';

// Match your C# LeaseDto structure
interface Lease {
  id: number;
  propertyId: number;
  tenantId: number;
  start: string; // ISO date string
  end: string;   // ISO date string
  rent: number;
  levy: number;
  bond: number;
}

const GetLease: React.FC = () => {
  const [leaseId, setLeaseId] = useState<string>('');
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const id = Number(leaseId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid lease ID (number > 0)');
      return;
    }

    setLoading(true);
    setError(null);
    setLease(null);

    try {
      // Get JWT token if exists
      const token = localStorage.getItem('token');
      const headers = token 
        ? { Authorization: `Bearer ${token}` } 
        : {};

      const response = await fetch(`http://localhost:5153/api/lease/${id}`, { headers });
      
      if (response.status === 404) {
        throw new Error('Lease not found');
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const  Lease = await response.json();
      setLease(data);
    } catch (err: any) {
      console.error('Lease fetch error:', err);
      setError(err.message || 'Failed to load lease');
    } finally {
      setLoading(false);
    }
  };

  // Format dates to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-ZA');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
              className="bi bi-search me-2" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            Find Lease by ID
          </h2>
        </div>
        <div className="card-body">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="Enter lease ID (e.g., 1, 5, 12)"
                value={leaseId}
                onChange={(e) => setLeaseId(e.target.value)}
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
                  'Search Lease'
                )}
              </button>
            </div>
            <div className="form-text">
              Enter the lease ID to view details
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

          {/* Lease Details */}
          {lease && (
            <div className="mt-4">
              <h3 className="mb-3 text-center">Lease Details</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card bg-light h-100">
                    <div className="card-header fw-bold">Property</div>
                    <div className="card-body">
                      <p className="mb-1">Property ID: <span className="fw-bold">#{lease.propertyId}</span></p>
                      <p className="mb-1">Tenant ID: <span className="fw-bold">#{lease.tenantId}</span></p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light h-100">
                    <div className="card-header fw-bold">Period</div>
                    <div className="card-body">
                      <p className="mb-1">Start: <span className="badge bg-info">{formatDate(lease.start)}</span></p>
                      <p className="mb-1">End: <span className="badge bg-warning text-dark">{formatDate(lease.end)}</span></p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card bg-light">
                    <div className="card-header fw-bold">Financial Details (ZAR)</div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col">
                          <div className="display-6 text-success">R{lease.rent.toLocaleString()}</div>
                          <small className="text-muted">Rent</small>
                        </div>
                        <div className="col">
                          <div className="display-6">R{lease.levy.toLocaleString()}</div>
                          <small className="text-muted">Levy</small>
                        </div>
                        <div className="col">
                          <div className="display-6 text-danger">R{lease.bond.toLocaleString()}</div>
                          <small className="text-muted">Bond</small>
                        </div>
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
          All values in South African Rand (ZAR)
        </p>
      </div>
    </div>
  );
};

export default GetLease;