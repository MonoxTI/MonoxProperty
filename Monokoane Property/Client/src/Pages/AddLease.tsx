// src/components/AllLeases.tsx
import React, { useState, useEffect } from 'react';

// Define the lease structure (matches your C# LeaseDto)
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

const AllLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leases when component loads
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        // Get JWT token from localStorage (if exists)
        const token = localStorage.getItem('token');
        const headers = token 
          ? { Authorization: `Bearer ${token}` } 
          : {};

        const response = await fetch('http://localhost:5153/api/lease', { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to load leases: ${response.status} ${response.statusText}`);
        }

        const  Lease[] = await response.json();
        setLeases(data);
      } catch (err: any) {
        console.error('Error fetching leases:', err);
        setError(err.message || 'Failed to load leases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  // Format dates to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-ZA');
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading leases...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
            className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <div>
            <h4 className="alert-heading">Error Loading Leases</h4>
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
            className="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
            <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
            <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v3.5a.5.5 0 0 0 .5.5h3.5L9.5 1z"/>
          </svg>
          Property Leases
        </h1>
        <span className="badge bg-primary fs-5">
          {leases.length} {leases.length === 1 ? 'Lease' : 'Leases'}
        </span>
      </div>

      {leases.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" 
              className="bi bi-house-door mb-3" viewBox="0 0 16 16">
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z"/>
            </svg>
            <h3>No Leases Found</h3>
            <p className="lead">Your property portfolio is empty</p>
            <p className="text-muted">Create a new lease to get started</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Tenant</th>
                <th>Period</th>
                <th className="text-end">Rent</th>
                <th className="text-end">Levy</th>
                <th className="text-end">Bond</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(lease => (
                <tr key={lease.id} className="align-middle">
                  <td className="fw-bold text-primary">#{lease.id}</td>
                  <td>#{lease.propertyId}</td>
                  <td>#{lease.tenantId}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {formatDate(lease.start)}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="badge bg-warning text-dark">
                      {formatDate(lease.end)}
                    </span>
                  </td>
                  <td className="text-end fw-bold text-success">R{lease.rent.toLocaleString()}</td>
                  <td className="text-end">R{lease.levy.toLocaleString()}</td>
                  <td className="text-end">R{lease.bond.toLocaleString()}</td>
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
          All financial values in South African Rand (ZAR)
        </p>
      </div>
    </div>
  );
};

export default AllLeases;