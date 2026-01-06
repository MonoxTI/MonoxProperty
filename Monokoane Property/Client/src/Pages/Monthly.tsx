// src/components/AddRentPayment.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types
======================= */

interface RentPaymentDto {
  id: number;
  leaseId: number;
  amount: number;
  paymentDate: string; // ISO date
  notes: string;
}

interface CreateRentPaymentRequest {
  leaseId: number;
  amount: number;
  paymentDate: string;
  notes: string;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const AddRentPayment: React.FC = () => {
  const [leaseId, setLeaseId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const leaseIdNum = parseInt(leaseId, 10);
    const amountNum = parseFloat(amount);

    if (isNaN(leaseIdNum) || leaseIdNum <= 0) {
      setError("Valid Lease ID is required");
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (!paymentDate) {
      setError("Payment date is required");
      return;
    }

    // Convert date to ISO string (UTC midnight)
    const isoDate = new Date(paymentDate).toISOString();

    const payload: CreateRentPaymentRequest = {
      leaseId: leaseIdNum,
      amount: amountNum,
      paymentDate: isoDate,
      notes: notes.trim(),
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/payment/rent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to record payment (${res.status})`;
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
      setTimeout(() => navigate("/payments"), 2000);
    } catch (err) {
      console.error("Add rent payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while recording the payment."
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
              <h2 className="card-title text-center mb-4 fw-bold">Add Rent Payment</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Rent Payment Recorded!</h5>
                  <p className="mb-0">Redirecting to payments list...</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="leaseId" className="form-label">
                      Lease ID
                    </label>
                    <input
                      type="number"
                      className="form-control w-100"
                      id="leaseId"
                      value={leaseId}
                      onChange={(e) => setLeaseId(e.target.value)}
                      min="1"
                      required
                      placeholder="e.g., 1, 2, 3..."
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
                      placeholder="e.g., 8500.00"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="paymentDate" className="form-label">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      className="form-control w-100"
                      id="paymentDate"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="notes" className="form-label">
                      Notes (Optional)
                    </label>
                    <textarea
                      className="form-control w-100"
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g., Paid via EFT, includes levy..."
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
                        Recording...
                      </>
                    ) : (
                      "Record Payment"
                    )}
                  </button>
                </form>
              )}

              {!success && (
                <div className="mt-3 text-center">
                  <a href="/payments" className="text-decoration-none">
                    ← Back to Payments
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

export default AddRentPayment;