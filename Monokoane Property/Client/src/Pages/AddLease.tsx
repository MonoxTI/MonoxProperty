// src/components/AddLease.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types (aligned with C# LeaseDto)
======================= */

interface LeaseDto {
  id: number;
  propertyId: number;
  tenantId: number;
  start: string; // ISO date string
  end: string;   // ISO date string
  rent: number;
  levy: number;
  bond: number;
}

interface CreateLeaseRequest {
  propertyId: number;
  tenantId: number;
  start: string;
  end: string;
  rent: number;
  levy: number;
  bond: number;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddLease: React.FC = () => {
  const [propertyId, setPropertyId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rent, setRent] = useState("");
  const [levy, setLevy] = useState("");
  const [bond, setBond] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Parse and validate numbers
    const propertyIdNum = parseInt(propertyId, 10);
    const tenantIdNum = parseInt(tenantId, 10);
    const rentNum = parseFloat(rent);
    const levyNum = parseFloat(levy);
    const bondNum = parseFloat(bond);

    if (isNaN(propertyIdNum) || propertyIdNum <= 0) {
      setError("Valid Property ID is required");
      return;
    }

    if (isNaN(tenantIdNum) || tenantIdNum <= 0) {
      setError("Valid Tenant ID is required");
      return;
    }

    if (isNaN(rentNum) || rentNum <= 0) {
      setError("Rent must be a positive amount");
      return;
    }

    if (isNaN(levyNum) || levyNum < 0) {
      setError("Levy must be zero or positive");
      return;
    }

    if (isNaN(bondNum) || bondNum < 0) {
      setError("Bond must be zero or positive");
      return;
    }

    if (!start) {
      setError("Start date is required");
      return;
    }

    if (!end) {
      setError("End date is required");
      return;
    }

    if (new Date(end) < new Date(start)) {
      setError("End date cannot be before start date");
      return;
    }

    // Convert dates to ISO strings (UTC midnight)
    const startIso = new Date(start).toISOString();
    const endIso = new Date(end).toISOString();

    const payload: CreateLeaseRequest = {
      propertyId: propertyIdNum,
      tenantId: tenantIdNum,
      start: startIso,
      end: endIso,
      rent: rentNum,
      levy: levyNum,
      bond: bondNum,
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/lease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to create lease (${res.status})`;
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text) as ApiErrorResponse;
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch {
          console.warn("Non-JSON error response:", text.substring(0, 200));
          errorMessage = `Server error: ${res.status} ${res.statusText || ""}`;
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => navigate("/leases"), 2000);
    } catch (err) {
      console.error("Add lease error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
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
              <h2 className="card-title text-center mb-4 fw-bold">Add New Lease</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Lease Created Successfully!</h5>
                  <p className="mb-0">Redirecting to leases list...</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="propertyId" className="form-label">
                      Property ID
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="propertyId"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      min="1"
                      required
                      placeholder="e.g. 1, 2, 3..."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="tenantId" className="form-label">
                      Tenant ID
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="tenantId"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      min="1"
                      required
                      placeholder="e.g. 101, 102..."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="start" className="form-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control w-100"
                      id="start"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="end" className="form-label">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control w-100"
                      id="end"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="rent" className="form-label">
                      Monthly Rent (R)
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="rent"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="e.g. 8500.00"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="levy" className="form-label">
                      Monthly Levy (R)
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="levy"
                      value={levy}
                      onChange={(e) => setLevy(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      placeholder="e.g. 950.00"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="bond" className="form-label">
                      Deposit / Bond (R)
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="bond"
                      value={bond}
                      onChange={(e) => setBond(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      placeholder="e.g. 17000.00"
                    />
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
                      "Create Lease"
                    )}
                  </button>
                </form>
              )}

              {!success && (
                <div className="mt-3 text-center">
                  <a href="/leases" className="text-decoration-none">
                    ← Back to Leases
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

export default AddLease;