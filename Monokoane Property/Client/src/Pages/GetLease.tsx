// src/components/LeaseLookupDelete.tsx
import React, { useState } from 'react';

// Match your C# LeaseDto
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

const LeaseLookupDelete: React.FC = () => {
  const [leaseId, setLeaseId] = useState<string>('');
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = Number(leaseId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid lease ID (number > 0)');
      return;
    }

    setLoading(true);
    setError(null);
    setLease(null);
    setDeleteSuccess(null);

    try {
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

      const data = await response.json();
      setLease(data as Lease);
    } catch (err: any) {
      console.error('Lease fetch error:', err);
      setError(err.message || 'Failed to load lease');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lease) return;

    if (!window.confirm(`Are you sure you want to delete Lease #${lease.id}? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token 
        ? { Authorization: `Bearer ${token}` } 
        : {};

      const response = await fetch(`http://localhost:5153/api/lease/${lease.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.status === 404) {
        throw new Error('Lease not found');
      }
      
      if (!response.ok) {
        const text = await response.text();
        let message = `Failed to delete lease (${response.status})`;
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text);
            message = errorData.message || errorData.title || message;
          }
        } catch {
          // Keep generic message
        }
        throw new Error(message);
      }

      setDeleteSuccess(`Lease #${lease.id} has been deleted successfully.`);
      setLease(null);
      setLeaseId("");
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete lease');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format dates to DD/MM/YYYY (South African format)
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-ZA');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
              className="bi bi-search me-2" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            Lease Lookup & Delete
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
                disabled={loading || deleteLoading}
                required
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={loading || deleteLoading}
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
              Enter the lease ID to view details and delete
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

          {/* Delete Success Message */}
          {deleteSuccess && (
            <div className="alert alert-success alert-dismissible fade show">
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" 
                  className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06l2.094 2.093a.75.75 0 0 0 1.06 0l3.71-3.71a.75.75 0 0 0-.022-1.08z"/>
                </svg>
                <div>{deleteSuccess}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setDeleteSuccess(null)}
              ></button>
            </div>
          )}

          {/* Lease Details */}
          {lease && !deleteSuccess && (
            <>
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

              {/* Delete Button */}
              <div className="mt-4 text-center">
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting Lease...
                    </>
                  ) : (
                    'Delete This Lease'
                  )}
                </button>
              </div>
            </>
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
          All values in South African Rand (ZAR) • Action cannot be undone
        </p>
      </div>
    </div>
  );
};

export default LeaseLookupDelete;