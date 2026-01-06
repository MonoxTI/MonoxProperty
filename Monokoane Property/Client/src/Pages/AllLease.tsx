// src/components/LeasesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const LeasesList: React.FC = () => {
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading leases.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA'); // South African format: DD/MM/YYYY
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
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Leases</h2>
        <Link to="/leases/add" className="btn btn-primary">
          Add Lease
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
          <p className="mt-2">Loading leases...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasesList;