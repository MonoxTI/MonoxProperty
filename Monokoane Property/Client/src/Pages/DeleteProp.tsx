// src/components/PropertyLookupDelete.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Match your C# PropertyDto
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

const PropertyLookupDelete: React.FC = () => {
  const [searchName, setSearchName] = useState<string>("");
  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchName.trim()) {
      setError("Please enter a property name");
      return;
    }

    setLoading(true);
    setError(null);
    setProperty(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5153/api/property/byname?name=${encodeURIComponent(searchName)}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (response.status === 404) {
        throw new Error("Property not found");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setProperty(data as PropertyDto);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    if (!window.confirm(`Are you sure you want to delete "${property.propertyName}"? This cannot be undone and may affect leases and expenses.`)) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5153/api/property/${property.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        const text = await response.text();
        let message = `Failed to delete property (${response.status})`;
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

      setDeleteSuccess(`Property "${property.propertyName}" has been deleted successfully.`);
      setProperty(null);
      setSearchName("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Property Lookup & Delete</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter property name (e.g., Montana Plaza)"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            disabled={loading || deleteLoading}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading || deleteLoading}
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

      {/* Delete Success Message */}
      {deleteSuccess && (
        <div className="alert alert-success">
          {deleteSuccess}
        </div>
      )}

      {/* Property Result */}
      {property && !deleteSuccess && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{property.propertyName}</h3>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Deleting...
                </>
              ) : (
                "Delete Property"
              )}
            </button>
          </div>
          <div className="card-body">
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Units:</strong> {property.units}</p>
            <p><strong>Type:</strong> {property.apartments ? "Apartments" : "Single Unit"}</p>
            <p><strong>Status:</strong> 
              <span className={`badge ms-2 ${property.occupied ? "bg-success" : "bg-warning"}`}>
                {property.occupied ? "Occupied" : "Vacant"}
              </span>
            </p>
            
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

export default PropertyLookupDelete;