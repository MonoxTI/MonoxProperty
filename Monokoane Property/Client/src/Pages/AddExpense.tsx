// src/components/AddExpense.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from '../Nav.tsx';

/* =======================
   Types
======================= */

interface PropertyDto {
  id: number;
  propertyName: string;
}

interface ExpenseDto {
  id: number;
  propertyId: number;
  description: string;
  amount: number;
  date: string;
}

interface CreateExpenseRequest {
  propertyId: number;
  description: string;
  amount: number;
  date: string; // ISO string
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddExpense: React.FC = () => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [propertyId, setPropertyId] = useState<number | "">("");

  // Lookup data
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch("http://localhost:5153/api/property", { headers });
        const text = await res.text();

        if (!res.ok) {
          throw new Error("Failed to load properties");
        }

        const data = text.trim() ? JSON.parse(text) : [];
        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch properties error:", err);
        setError("Failed to load properties. Please refresh.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (propertyId === "") {
      setError("Please select a property");
      return;
    }

    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    const isoDate = new Date(date).toISOString();

    const payload: CreateExpenseRequest = {
      propertyId: propertyId as number,
      description,
      amount: amountNum,
      date: isoDate,
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to add expense (${res.status})`;
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
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      console.error("Add expense error:", err);
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
          <p className="mt-2">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5">
      <Navigation />
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">Add New Expense</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Expense Added Successfully!</h5>
                  <p className="mb-0">Redirecting to expenses list...</p>
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
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.propertyName} (ID: {property.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control w-100"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="e.g. Water bill, Roof repair"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                      Amount (R)
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="e.g. 450.75"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control w-100"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
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
                      "Add Expense"
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

export default AddExpense;