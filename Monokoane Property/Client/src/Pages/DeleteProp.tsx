// src/components/PropertiesManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';

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

const PropertiesManagement: React.FC = () => {
  // State for All Properties
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [errorProperties, setErrorProperties] = useState<string | null>(null);

  // State for Lookup & Delete
  const [searchName, setSearchName] = useState<string>("");
  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Fetch all properties on mount
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
        setErrorProperties(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading properties.'
        );
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle property search
  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!searchName.trim()) {
    setErrorSearch("Please enter a property name");
    return;
  }

  setLoadingSearch(true);
  setErrorSearch(null);
  setProperty(null);
  setDeleteSuccess(null);

  try {
    const token = localStorage.getItem("token");
    
    // 👇 SEND POST REQUEST WITH NAME IN BODY
    const response = await fetch(`http://localhost:5153/api/property/byname`, {
      method: "POST", // 👈 Changed from GET to POST
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ propertyName: searchName.trim() }) // 👈 Send name in request body
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
    setErrorSearch(err.message || "Failed to fetch property");
  } finally {
    setLoadingSearch(false);
  }
};

  // Handle property delete
  const handleDelete = async () => {
    if (!property) return;

    if (!window.confirm(`Are you sure you want to delete "${property.propertyName}"? This cannot be undone and may affect leases and expenses.`)) {
      return;
    }

    setDeleteLoading(true);
    setErrorSearch(null);
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
      
      // Refresh properties list after delete
      setTimeout(() => {
        const fetchProperties = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5153/api/property', {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            const text = await res.text();
            if (res.ok && text.trim()) {
              const data = JSON.parse(text) as PropertyDto[];
              setProperties(Array.isArray(data) ? data : []);
            }
          } catch (err) {
            console.error('Refresh properties error:', err);
          }
        };
        fetchProperties();
      }, 1000);
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorSearch(err.message || "Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Property Management</h2>
        <Link to="/add-property" className="btn btn-primary">
          Add Property
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Card: All Properties Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">All Properties ({properties.length})</h5>
            </div>
            <div className="card-body p-0">
              {errorProperties && (
                <div className="alert alert-danger m-3" role="alert">
                  {errorProperties}
                </div>
              )}

              {loadingProperties ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading properties...</p>
                </div>
              ) : (
                <>
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
                              <td>
                                <Link to={`/properties/${property.id}`} className="text-decoration-none">
                                  {property.propertyName}
                                </Link>
                              </td>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Lookup & Delete */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Find & Delete Property</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter property name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    disabled={loadingSearch || deleteLoading}
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

              {/* Property Result */}
              {property && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">{property.propertyName}</h6>
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
                        "Delete"
                      )}
                    </button>
                  </div>
                  
                  <p className="mb-1"><strong>Location:</strong> {property.location}</p>
                  <p className="mb-1"><strong>Units:</strong> {property.units}</p>
                  <p className="mb-1"><strong>Type:</strong> {property.apartments ? "Apartments" : "Single Unit"}</p>
                  <p className="mb-1">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${property.occupied ? "bg-success" : "bg-warning"}`}>
                      {property.occupied ? "Occupied" : "Vacant"}
                    </span>
                  </p>
                  
                  <div className="mt-3 pt-2 border-top">
                    <small className="text-muted">
                      Leases: {property.leases?.length || 0} | 
                      Expenses: {property.expenses?.length || 0}
                    </small>
                  </div>
                </div>
              )}

              {!property && !deleteSuccess && !errorSearch && (
                <div className="text-center text-muted py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="mt-2 mb-0">Search for a property to manage</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesManagement;