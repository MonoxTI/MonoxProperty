// src/components/AddExpense.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types (matched to your C# ExpenseDto)
======================= */

interface ExpenseDto {
  id: number;
  propertyId: number;
  description: string;
  amount: number; // maps to decimal in C#
  date: string;   // ISO 8601 string
}

interface CreateExpenseRequest {
  propertyId: number;
  description: string;
  amount: number;
  date: string; // ISO string like "2025-01-05T10:30:00Z"
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddExpense: React.FC = () => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // Will be YYYY-MM-DD from input
  const [propertyId, setPropertyId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const amountNum = parseFloat(amount);
    const propertyIdNum = parseInt(propertyId, 10);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (isNaN(propertyIdNum) || propertyIdNum <= 0) {
      setError("Valid Property ID is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    // Convert date to ISO string (UTC midnight for consistency)
    // e.g. "2025-01-05" → "2025-01-05T00:00:00Z"
    const isoDate = new Date(date).toISOString();

    const payload: CreateExpenseRequest = {
      propertyId: propertyIdNum,
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
      setTimeout(() => navigate("/expenses"), 2000);
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

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
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

              {!success && (
                <div className="mt-3 text-center">
                  <a href="/expenses" className="text-decoration-none">
                    ← Back to Expenses
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

export default AddExpense;