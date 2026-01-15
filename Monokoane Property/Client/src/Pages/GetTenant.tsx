// src/components/TenantsManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';

interface Tenant {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

const TenantsManagement: React.FC = () => {
  // State for All Tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [errorTenants, setErrorTenants] = useState<string | null>(null);

  // State for Lookup & Delete
  const [tenantId, setTenantId] = useState<string>('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Fetch all tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:5153/api/tenant', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const text = await res.text();

        if (!res.ok) {
          let errorMessage = `Failed to load tenants (${res.status})`;
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
          setTenants([]);
          return;
        }

        const data = JSON.parse(text) as Tenant[];
        setTenants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch tenants error:', err);
        setErrorTenants(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading tenants.'
        );
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchTenants();
  }, []);

  // Handle tenant search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = Number(tenantId);
    if (isNaN(id) || id <= 0) {
      setErrorSearch('Please enter a valid tenant ID (number > 0)');
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setTenant(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem('token');
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

      const data = await response.json();
      setTenant(data as Tenant);
    } catch (err: any) {
      console.error('Tenant fetch error:', err);
      setErrorSearch(err.message || 'Failed to load tenant');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle tenant delete
  const handleDelete = async () => {
    if (!tenant) return;

    if (!window.confirm(`Are you sure you want to delete "${tenant.fullName}"? This cannot be undone and may affect active leases.`)) {
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

      const response = await fetch(`http://localhost:5153/api/tenant/${tenant.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.status === 404) {
        throw new Error('Tenant not found');
      }
      
      if (!response.ok) {
        const text = await response.text();
        let message = `Failed to delete tenant (${response.status})`;
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

      setDeleteSuccess(`Tenant "${tenant.fullName}" has been deleted successfully.`);
      setTenant(null);
      setTenantId("");
      
      // Refresh tenants list after delete
      setTimeout(() => {
        const fetchTenants = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5153/api/tenant', {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            const text = await res.text();
            if (res.ok && text.trim()) {
              const data = JSON.parse(text) as Tenant[];
              setTenants(Array.isArray(data) ? data : []);
            }
          } catch (err) {
            console.error('Refresh tenants error:', err);
          }
        };
        fetchTenants();
      }, 1000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorSearch(err.message || 'Failed to delete tenant. The tenant may have active leases.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format South African phone number
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+27') && cleaned.length === 12) {
      return `+27 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone.replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{3})(\d)/, '$1 $2');
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Tenant Management</h2>
        <Link to="/add-tenant" className="btn btn-primary">
          Add Tenant
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Card: All Tenants Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">All Tenants ({tenants.length})</h5>
            </div>
            <div className="card-body p-0">
              {errorTenants && (
                <div className="alert alert-danger m-3" role="alert">
                  {errorTenants}
                </div>
              )}

              {loadingTenants ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading tenants...</p>
                </div>
              ) : (
                <>
                  {tenants.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="64"
                          height="64"
                          fill="currentColor"
                          className="bi bi-person text-muted"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 0 4Zm-1-.004c-.001-.246-.154-.487-.407-.636C10.876 11.225 10.395 11 10 11c-.4 0-.8.2-.972.5h-.028a.5.5 0 0 1-.5-.5Z" />
                        </svg>
                      </div>
                      <p className="mb-3">No tenants found.</p>
                      <Link to="add-tenant" className="btn btn-primary">
                        Add Your First Tenant
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenants.map((tenant) => (
                            <tr key={tenant.id} className="align-middle">
                              <td>#{tenant.id}</td>
                              <td>
                                <Link to={`/tenants/${tenant.id}`} className="text-decoration-none">
                                  {tenant.fullName}
                                </Link>
                              </td>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Lookup & Delete */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Find & Delete Tenant</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter tenant ID"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
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

              {/* Tenant Details */}
              {tenant && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="text-center mb-3">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                      style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                      {tenant.fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>ID:</strong>
                        <span className="text-primary">#{tenant.id}</span>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Name:</strong>
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
                          {formatPhoneNumber(tenant.phoneNumber)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-top">
                    <button
                      className="btn btn-danger w-100"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Deleting...
                        </>
                      ) : (
                        'Delete Tenant'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!tenant && !deleteSuccess && !errorSearch && (
                <div className="text-center text-muted py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="mt-2 mb-0">Search for a tenant to manage</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantsManagement;