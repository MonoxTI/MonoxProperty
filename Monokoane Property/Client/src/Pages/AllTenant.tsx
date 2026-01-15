// src/components/AllTenants.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading tenants.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Format South African phone number: +27 82 123 4567 or 082 123 4567
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters (keep +)
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If starts with +27, format as +27 XX XXX XXXX
    if (cleaned.startsWith('+27') && cleaned.length === 12) {
      return `+27 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    // If starts with 0 and 10 digits, format as 0XX XXX XXXX
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    // Fallback: just clean spacing
    return phone.replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{3})(\d)/, '$1 $2');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Tenants</h2>
        <Link to="/add-tenant" className="btn btn-primary">
          Add Tenant
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tenants...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
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
                <Link to="/tenants/add" className="btn btn-primary">
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
                        <td>{tenant.fullName}</td>
                        <td>
                          <a
                            href={`mailto:${tenant.email}`}
                            className="text-decoration-none"
                          >
                            {tenant.email}
                          </a>
                        </td>
                        <td>
                          <a
                            href={`tel:${tenant.phoneNumber}`}
                            className="text-decoration-none"
                          >
                            {formatPhoneNumber(tenant.phoneNumber)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTenants;