// src/components/AddLease.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types
======================= */

interface PropertyDto {
  id: number;
  propertyName: string;
}

interface TenantDto {
  id: number;
  fullName: string;
  email: string;
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
  // Form state
  const [propertyId, setPropertyId] = useState<number | "">("");
  const [tenantId, setTenantId] = useState<number | "">("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rent, setRent] = useState("");
  const [levy, setLevy] = useState("");
  const [bond, setBond] = useState("");

  // Lookup data
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const navigate = useNavigate();

  // Fetch properties and tenants on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [propertiesRes, tenantsRes] = await Promise.all([
          fetch("http://localhost:5153/api/property", { headers }),
          fetch("http://localhost:5153/api/tenant", { headers })
        ]);

        const [propertiesText, tenantsText] = await Promise.all([
          propertiesRes.text(),
          tenantsRes.text()
        ]);

        if (!propertiesRes.ok || !tenantsRes.ok) {
          throw new Error("Failed to load lookup data");
        }

        const propertiesData = propertiesText.trim() ? JSON.parse(propertiesText) : [];
        const tenantsData = tenantsText.trim() ? JSON.parse(tenantsText) : [];

        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      } catch (err) {
        console.error("Fetch lookup data error:", err);
        setError("Failed to load properties or tenants. Please refresh.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (propertyId === "") {
      setError("Please select a property");
      return;
    }

    if (tenantId === "") {
      setError("Please select a tenant");
      return;
    }

    const rentNum = parseFloat(rent);
    const levyNum = parseFloat(levy);
    const bondNum = parseFloat(bond);

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

    // Convert dates to ISO strings
    const startIso = new Date(start).toISOString();
    const endIso = new Date(end).toISOString();

    const payload: CreateLeaseRequest = {
      propertyId: propertyId as number,
      tenantId: tenantId as number,
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

  if (isLoadingData) {
    return (
      <div className="container-fluid mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading properties and tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-12">
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
                      Property
                    </label>
                    <select
                      className="form-select w-100"
                      id="propertyId"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : "")}
                      required
                    >
                      <option value="">-- Select a property --</option>
                      {properties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.propertyName} (ID: {prop.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="tenantId" className="form-label">
                      Tenant
                    </label>
                    <select
                      className="form-select w-100"
                      id="tenantId"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : "")}
                      required
                    >
                      <option value="">-- Select a tenant --</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.fullName} (ID: {tenant.id})
                        </option>
                      ))}
                    </select>
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
                        Creating Lease...
                      </>
                    ) : (
                      "Create Lease"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLease;