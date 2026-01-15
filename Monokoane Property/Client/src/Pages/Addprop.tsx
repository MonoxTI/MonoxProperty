// src/components/AddProperty.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types
======================= */

interface CreatePropertyRequest {
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddProperty: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [location, setLocation] = useState("");
  const [apartments, setApartments] = useState(false);
  const [units, setUnits] = useState(0);
  const [occupied, setOccupied] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 🔒 Backend rule mirrored in frontend
    if (apartments && units <= 0) {
      setError("Number of units is required for apartment properties.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to add a property.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const payload: CreatePropertyRequest = {
      propertyName,
      location,
      apartments,
      units: apartments ? units : 0, // 👈 force clean data
      occupied,
    };

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5153/api/property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let message = "Failed to create property";

        try {
          if (text.trim()) {
            const err = JSON.parse(text) as ApiErrorResponse;
            message = err.message || err.title || message;
          }
        } catch {
          message = `${res.status} ${res.statusText}`;
        }

        throw new Error(message);
      }

      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Add New Property</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Property Name */}
            <div className="mb-3">
              <label className="form-label">Property Name</label>
              <input
                className="form-control"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="mb-3">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Apartment toggle */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={apartments}
                onChange={(e) => {
                  setApartments(e.target.checked);
                  if (!e.target.checked) setUnits(0); // 👈 reset
                }}
              />
              <label className="form-check-label">
                Apartment building?
              </label>
            </div>

            {/* Units – ONLY when apartments */}
            {apartments && (
              <div className="mb-3">
                <label className="form-label">Number of Units</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  required
                />
              </div>
            )}

            {/* Occupied */}
            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                checked={occupied}
                onChange={(e) => setOccupied(e.target.checked)}
              />
              <label className="form-check-label">
                Mark as currently occupied
              </label>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={() => navigate("/home")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
