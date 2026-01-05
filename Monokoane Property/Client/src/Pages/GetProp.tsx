// src/components/PropertyByName.tsx
import React, { useState } from 'react';

// Match your C# PropertyDto structure
interface PropertyDto {
  id: number;
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
  leases: any[];
  expenses: any[];
}

const PropertyByName: React.FC = () => {
  const [searchName, setSearchName] = useState<string>("");
  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchName.trim()) {
      setError("Please enter a property name");
      return;
    }

    setLoading(true);
    setError(null);
    setProperty(null);

    try {
      const response = await fetch(`http://localhost:5153/api/property/byname`, {
        headers: {
          // Add auth token if needed:
           "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 404) {
        throw new Error("Property not found");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const  data = await response.json();
      setProperty(data);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Search Property by Name</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter property name (e.g., Montana Plaza)"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            disabled={loading}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Property Result */}
      {property && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">{property.propertyName}</h3>
          </div>
          <div className="card-body">
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Units:</strong> {property.units}</p>
            <p><strong>Apartments:</strong> {property.apartments ? "Yes" : "No"}</p>
            <p><strong>Status:</strong> 
              <span className={`badge ms-2 ${property.occupied ? "bg-success" : "bg-warning"}`}>
                {property.occupied ? "Occupied" : "Vacant"}
              </span>
            </p>
            
            {/* Optional: Show leases/expenses count */}
            <div className="mt-3 pt-3 border-top">
              <small className="text-muted">
                Leases: {property.leases?.length || 0} | 
                Expenses: {property.expenses?.length || 0}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyByName;