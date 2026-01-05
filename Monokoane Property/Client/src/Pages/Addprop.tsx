// src/components/AddProperty.tsx
import React, { useState } from "react";

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

/* =======================
   Config
======================= */

const API_URL = import.meta.env.VITE_API_URL;

/* =======================
   Component
======================= */

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

      const res = await fetch(`${API_URL}/api/property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const apiError = data as ApiErrorResponse;

        const message =
          apiError.title ||
          apiError.message ||
          "Failed to create property";

        throw new Error(message);
      }

      setResponse(data as PropertyDto);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow-sm bg-light"
      >
        <h2 className="mb-4">Add New Property</h2>

        <div className="mb-3">
          <label className="form-label">Property Name</label>
          <input
            type="text"
            className="form-control"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Number of Units</label>
          <input
            type="number"
            className="form-control"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            min={1}
            required
          />
        </div>

        <div className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={apartments}
            onChange={(e) => setApartments(e.target.checked)}
          />
          <label className="form-check-label">Apartments?</label>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={occupied}
            onChange={(e) => setOccupied(e.target.checked)}
          />
          <label className="form-check-label">Occupied?</label>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add Property"}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger mt-3">{error}</div>
      )}

      {response && (
        <div className="alert alert-success mt-3">
          <h5>Property Created Successfully</h5>
          <pre className="bg-light p-2 rounded mt-2">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AddProperty;
