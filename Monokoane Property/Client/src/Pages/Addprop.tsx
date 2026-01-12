// src/components/AddProperty.tsx
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

/* =======================
   Types
======================= */

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

interface CreatePropertyRequest {
  propertyName: string;
  location: string;
  units: number;
  apartments: boolean;
  occupied: boolean;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddProperty: React.FC = () => {
  const [propertyName, setPropertyName] = useState("");
  const [location, setLocation] = useState("");
  const [units, setUnits] = useState("");
  const [apartments, setApartments] = useState(false);
  const [occupied, setOccupied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate units
    const unitsNum = Number(units);
    if (!Number.isInteger(unitsNum) || unitsNum < 1) {
      setError("Units must be a positive whole number");
      return;
    }

    // Check for valid token BEFORE request
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to add a property");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const payload: CreatePropertyRequest = {
      propertyName,
      location,
      units: unitsNum,
      apartments,
      occupied,
    };

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to create property (${res.status})`;
        
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text) as ApiErrorResponse;
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch {
          console.warn("Non-JSON error response from server:", text.substring(0, 200));
          errorMessage = `Server error: ${res.status} ${res.statusText || ''}`;
        }

        throw new Error(errorMessage);
      }

      // Success! Navigate back to home
      console.log("Property created successfully");
      navigate('/home');

    } catch (err) {
      console.error("Add property error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "An unexpected error occurred while saving the property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Add New Property</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="propertyName" className="form-label">Property Name</label>
              <input
                type="text"
                className="form-control"
                id="propertyName"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
                placeholder="e.g. Sunridge Apartments"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Pretoria, Montana"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="units" className="form-label">Number of Units</label>
              <input
                type="number"
                className="form-control"
                id="units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                min="1"
                required
                placeholder="e.g. 12"
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="apartments"
                  checked={apartments}
                  onChange={(e) => setApartments(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="apartments">
                  This is an apartment complex
                </label>
              </div>
            </div>

            <div className="mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="occupied"
                  checked={occupied}
                  onChange={(e) => setOccupied(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="occupied">
                  Mark as currently occupied
                </label>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Add Property"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;