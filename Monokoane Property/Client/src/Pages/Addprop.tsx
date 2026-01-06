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
  const [response, setResponse] = useState<PropertyDto | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    const unitsNum = Number(units);
    if (!Number.isInteger(unitsNum) || unitsNum < 1) {
      setError("Units must be a positive whole number");
      return;
    }

    const payload: CreatePropertyRequest = {
      propertyName,
      location,
      units: unitsNum,
      apartments,
      occupied,
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      // ✅ Get raw text first to avoid JSON parsing crash
      const text = await res.text();

      // Handle non-OK responses
      if (!res.ok) {
        let errorMessage = `Failed to create property (${res.status})`;
        
        // Try to parse as JSON error (if possible)
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text) as ApiErrorResponse;
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch {
          // If not JSON (e.g., HTML error page), show status
          console.warn("Non-JSON error response from server:", text.substring(0, 200));
          errorMessage = `Server error: ${res.status} ${res.statusText || ''}`;
        }

        throw new Error(errorMessage);
      }

      // Handle empty success response
      if (!text.trim()) {
        // If the API returns 200 with no body, assume success with minimal data
        setResponse({
          id: 0,
          propertyName,
          location,
          units: unitsNum,
          apartments,
          occupied,
          leases: [],
          expenses: []
        });
        return;
      }

      // Parse JSON only if not empty
      const data = JSON.parse(text) as PropertyDto;
      setResponse(data);
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">Add New Property</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {response && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Property Created Successfully!</h5>
                  <p className="mb-0">
                    <strong>{response.propertyName}</strong> has been added.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="propertyName" className="form-label">Property Name</label>
                  <input
                    type="text"
                    className="form-control w-100"
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
                    className="form-control w-100"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Pretoria, Montana"
                  />
                </div>

                <div className = "mb-3">
                  <label htmlFor="units" className="form-label">Number of Units</label>
                  <input
                    type="number"
                    className="form-control w-100"
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

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
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
              </form>

              {!response && (
                <div className="mt-3 text-center">
                  <a href="/properties" className="text-decoration-none">
                    ← Back to Properties
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;