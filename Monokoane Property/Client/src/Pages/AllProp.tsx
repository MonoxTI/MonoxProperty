// src/components/PropertyList.tsx
import React, { useState, useEffect } from 'react';

// Match your C# PropertyDto structure
interface PropertyDto {
  id: number;
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
  leases: any[];     // Replace with LeaseDto[] later
  expenses: any[];   // Replace with ExpenseDto[] later
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties when component loads
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5153/api/property", {
          headers: {
            // Include auth token if your API uses [Authorize]
             "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PropertyDto[] = await response.json();
        setProperties(data);
      } catch (err: any) {
        //console.error("Failed to fetch properties:", err);
        setError(err.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []); // Empty dependency array = run once on load

  // Loading state
  if (loading) {
    return <div className="container mt-4">Loading properties...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Properties</h2>
      
      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="row">
          {properties.map(property => (
            <div key={property.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{property.propertyName}</h5>
                  <p className="card-text">
                    <strong>Location:</strong> {property.location}<br />
                    <strong>Units:</strong> {property.units}<br />
                    <strong>Apartments:</strong> {property.apartments ? "Yes" : "No"}<br />
                    <strong>Occupied:</strong> {property.occupied ? "Yes" : "No"}
                  </p>
                  <div className="d-flex justify-content-between">
                    <span className="badge bg-primary">
                      {property.apartments ? "Multi-Unit" : "Single"}
                    </span>
                    <span className={`badge ${property.occupied ? "bg-success" : "bg-warning"}`}>
                      {property.occupied ? "Occupied" : "Vacant"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;