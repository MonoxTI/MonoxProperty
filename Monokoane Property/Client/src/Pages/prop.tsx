// src/components/AddProperty.tsx
import React, { useState } from 'react';
//import Nav from './Nav'; // Adjust path as needed

// Define the shape of your C# PropertyDto
interface PropertyDto {
  id: number;
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
  leases: any[];     // Replace with LeaseDto[] when available
  expenses: any[];   // Replace with ExpenseDto[] when available
}

// Request payload (subset of PropertyDto for creation)
interface CreatePropertyRequest {
  PropertyName: string;
  Location: string;
  Units: number;
  Apartments: boolean;
  Occupied: boolean;
}

const AddProperty: React.FC = () => {
  const [propertyName, setPropertyName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [units, setUnits] = useState<string>("");
  const [apartments, setApartments] = useState<boolean>(false);
  const [occupied, setOccupied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<PropertyDto | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    // Validate units is a positive number
    const unitsNum = Number(units);
    if (isNaN(unitsNum) || unitsNum < 1) {
      setError("Units must be a positive number");
      setLoading(false);
      return;
    }

    try {
      const payload: CreatePropertyRequest = {
        PropertyName: propertyName,
        Location: location,
        Units: unitsNum,
        Apartments: apartments,
        Occupied: occupied
      };

      const res = await fetch("http://localhost:5153/api/property", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add Authorization header if needed:
           "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const data: PropertyDto = await res.json();

      if (!res.ok) {
        const errorMsg = data?.message || 'Failed to create property';
        throw new Error(errorMsg);
      }

      setResponse(data);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
      <form 
        onSubmit={handleSubmit} 
        className="container mt-4 p-4 border rounded shadow-sm bg-light"
      >
        <h2 className="mb-4">Add New Property</h2>
        
        <div className="mb-3">
          <label htmlFor="propertyName" className="form-label">
            Property Name
          </label>
          <input 
            id="propertyName"
            type="text"
            className="form-control"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input 
            id="location"
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="units" className="form-label">
            Number of Units
          </label>
          <input 
            id="units"
            type="number"
            className="form-control"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="apartments"
            checked={apartments}
            onChange={(e) => setApartments(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="apartments">
            Apartments?
          </label>
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="occupied"
            checked={occupied}
            onChange={(e) => setOccupied(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="occupied">
            Occupied?
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Property"}
        </button>
      </form>

      {error && (
        <div className="container mt-3">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      
      {response && (
        <div className="container mt-3">
          <div className="alert alert-success">
            <h5>Property Created Successfully!</h5>
            <pre className="mt-2 p-2 bg-light rounded">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProperty;