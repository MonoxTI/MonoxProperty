// src/components/LeasesManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';

interface LeaseDto {
  id: number;
  propertyId: number;
  tenantId: number;
  start: string; // ISO date string
  end: string;   // ISO date string
  rent: number;
  levy: number;
  bond: number;
}

const LeasesManagement: React.FC = () => {
  // State for All Leases
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [errorLeases, setErrorLeases] = useState<string | null>(null);

  // State for Lookup & Delete
  const [leaseId, setLeaseId] = useState<string>('');
  const [lease, setLease] = useState<LeaseDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Fetch all leases on mount
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:5153/api/lease', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const text = await res.text();

        if (!res.ok) {
          let errorMessage = `Failed to load leases (${res.status})`;
          try {
            if (text.trim()) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorData.title || errorMessage;
            }
          } catch {
            console.warn('Non-JSON error response:', text.substring(0, 200));
            errorMessage = `Server error: ${res.status} ${res.statusText || ''}`;
          }
          throw new Error(errorMessage);
        }

        if (!text.trim()) {
          setLeases([]);
          return;
        }

        const data = JSON.parse(text) as LeaseDto[];
        setLeases(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch leases error:', err);
        setErrorLeases(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading leases.'
        );
      } finally {
        setLoadingLeases(false);
      }
    };

    fetchLeases();
  }, []);

  // Handle lease search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = Number(leaseId);
    if (isNaN(id) || id <= 0) {
      setErrorSearch('Please enter a valid lease ID (number > 0)');
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
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
      setLease(data as LeaseDto);
    } catch (err: any) {
      console.error('Lease fetch error:', err);
      setErrorSearch(err.message || 'Failed to load lease');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle lease delete
  const handleDelete = async () => {
    if (!lease) return;

    if (!window.confirm(`Are you sure you want to delete Lease #${lease.id}? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setErrorSearch(null);
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
      
      // Refresh leases list after delete
      setTimeout(() => {
        const fetchLeases = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5153/api/lease', {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            const text = await res.text();
            if (res.ok && text.trim()) {
              const data = JSON.parse(text) as LeaseDto[];
              setLeases(Array.isArray(data) ? data : []);
            }
          } catch (err) {
            console.error('Refresh leases error:', err);
          }
        };
        fetchLeases();
      }, 1000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorSearch(err.message || 'Failed to delete lease');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date as DD/MM/YYYY (South African format)
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA');
  };

  // Format currency as R1,234.50
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Lease Management</h2>
        <Link to="/add-lease" className="btn btn-primary">
          Add Lease
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Card: All Leases Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">All Leases ({leases.length})</h5>
            </div>
            <div className="card-body p-0">
              {errorLeases && (
                <div className="alert alert-danger m-3" role="alert">
                  {errorLeases}
                </div>
              )}

              {loadingLeases ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading leases...</p>
                </div>
              ) : (
                <>
                  {leases.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="mb-0">No leases found.</p>
                      <Link to="/leases/add" className="btn btn-outline-primary mt-2">
                        Create your first lease
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Lease ID</th>
                            <th>Property ID</th>
                            <th>Tenant ID</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Rent</th>
                            <th>Levy</th>
                            <th>Bond</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leases.map((lease) => (
                            <tr key={lease.id}>
                              <td>#{lease.id}</td>
                              <td>#{lease.propertyId}</td>
                              <td>#{lease.tenantId}</td>
                              <td>{formatDate(lease.start)}</td>
                              <td>{formatDate(lease.end)}</td>
                              <td>{formatCurrency(lease.rent)}</td>
                              <td>{formatCurrency(lease.levy)}</td>
                              <td>{formatCurrency(lease.bond)}</td>
                              <td>
                                <Link
                                  to={`/leases/${lease.id}`}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Lookup & Delete */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Find & Delete Lease</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter lease ID"
                    value={leaseId}
                    onChange={(e) => setLeaseId(e.target.value)}
                    min="1"
                    disabled={loadingSearch || deleteLoading}
                    required
                  />
                  <button 
                    className="btn btn-primary"
                    type="submit"
                    disabled={loadingSearch || deleteLoading}
                  >
                    {loadingSearch ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              {/* Search Error */}
              {errorSearch && (
                <div className="alert alert-danger" role="alert">
                  {errorSearch}
                </div>
              )}

              {/* Delete Success */}
              {deleteSuccess && (
                <div className="alert alert-success" role="alert">
                  {deleteSuccess}
                </div>
              )}

              {/* Lease Details */}
              {lease && !deleteSuccess && (
                <div className="border rounded p-3">
                  <h6 className="text-center mb-3">Lease #{lease.id}</h6>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="card bg-light">
                        <div className="card-header fw-bold text-center py-2">Property</div>
                        <div className="card-body p-2 text-center">
                          <p className="mb-1 small">Property ID: <strong>#{lease.propertyId}</strong></p>
                          <p className="mb-0 small">Tenant ID: <strong>#{lease.tenantId}</strong></p>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-light">
                        <div className="card-header fw-bold text-center py-2">Period</div>
                        <div className="card-body p-2 text-center">
                          <p className="mb-1 small">Start: <span className="badge bg-info">{formatDate(lease.start)}</span></p>
                          <p className="mb-0 small">End: <span className="badge bg-warning text-dark">{formatDate(lease.end)}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-light mb-3">
                    <div className="card-header fw-bold text-center py-2">Financial Details</div>
                    <div className="card-body p-2">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="fs-6 text-success">{formatCurrency(lease.rent)}</div>
                          <small className="text-muted">Rent</small>
                        </div>
                        <div className="col-4">
                          <div className="fs-6">{formatCurrency(lease.levy)}</div>
                          <small className="text-muted">Levy</small>
                        </div>
                        <div className="col-4">
                          <div className="fs-6 text-danger">{formatCurrency(lease.bond)}</div>
                          <small className="text-muted">Bond</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-top">
                    <button
                      className="btn btn-danger w-100"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Deleting Lease...
                        </>
                      ) : (
                        'Delete Lease'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!lease && !deleteSuccess && !errorSearch && (
                <div className="text-center text-muted py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="mt-2 mb-0">Search for a lease to manage</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeasesManagement;