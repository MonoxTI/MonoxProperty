// src/components/AllProperties.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Match your C# PropertyDto
interface PropertyDto {
  id: number;
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
  // You can keep leases/expenses as any[] or define types later
  leases: any[];
  expenses: any[];
}

const AllProperties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:5153/api/property', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const text = await res.text();

        if (!res.ok) {
          let errorMessage = `Failed to load properties (${res.status})`;
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
          setProperties([]);
          return;
        }

        const data = JSON.parse(text) as PropertyDto[];
        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch properties error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading properties.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Properties</h2>
        <Link to="/properties/add" className="btn btn-primary">
          Add Property
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
          <p className="mt-2">Loading properties...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {properties.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    fill="currentColor"
                    className="bi bi-house text-muted"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L8.707 1.5Z" />
                  </svg>
                </div>
                <p className="mb-3">No properties found.</p>
                <Link to="/properties/add" className="btn btn-primary">
                  Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Property Name</th>
                      <th>Location</th>
                      <th>Units</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className="align-middle">
                        <td>#{property.id}</td>
                        <td>{property.propertyName}</td>
                        <td>{property.location}</td>
                        <td>{property.units}</td>
                        <td>{property.apartments ? 'Apartments' : 'Single Unit'}</td>
                        <td>
                          <span
                            className={`badge ${
                              property.occupied ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {property.occupied ? 'Occupied' : 'Vacant'}
                          </span>
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

export default AllProperties;