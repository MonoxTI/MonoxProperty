// src/components/RecordPayment.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Types (aligned with your C# Dto)
======================= */

interface LeaseDto {
  id: number;
  propertyId: number;
  propertyName: string; // Added for display
  tenantId: number;
  tenantName: string;   // Added for display
  rent: number;
}

enum PaymentType {
  Rent = 0,
  Levy = 1,
  Bond = 2,
  Other = 3
}

interface RecordPaymentDto {
  leaseId: number;
  type: PaymentType;
  amount: number;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const RecordPayment: React.FC = () => {
  const [leaseId, setLeaseId] = useState<number | "">("");
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Rent);
  const [amount, setAmount] = useState("");

  // Lookup data
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Fetch active leases on mount
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch("http://localhost:5153/api/lease/active", { headers });
        const text = await res.text();

        if (!res.ok) {
          throw new Error("Failed to load leases");
        }

        const data = text.trim() ? JSON.parse(text) : [];
        setLeases(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch leases error:", err);
        setError("Failed to load leases. Please refresh.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLeases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (leaseId === "") {
      setError("Please select a lease");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    const payload: RecordPaymentDto = {
      leaseId: leaseId as number,
      type: paymentType,
      amount: amountNum,
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5153/api/payment`, {
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
      console.error("Record payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get payment type label
  const getPaymentTypeLabel = (type: PaymentType): string => {
    switch (type) {
      case PaymentType.Rent: return "Rent";
      case PaymentType.Levy: return "Levy";
      case PaymentType.Bond: return "Bond";
      case PaymentType.Other: return "Other";
      default: return "Unknown";
    }
  };

  if (isLoadingData) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading active leases...</p>
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
              <h2 className="card-title text-center mb-4 fw-bold">Record Payment</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Payment Recorded Successfully!</h5>
                  <p className="mb-0">Redirecting to payments list...</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="leaseId" className="form-label">
                      Lease
                    </label>
                    <select
                      className="form-select w-100"
                      id="leaseId"
                      value={leaseId}
                      onChange={(e) => setLeaseId(e.target.value ? Number(e.target.value) : "")}
                      required
                    >
                      <option value="">-- Select an active lease --</option>
                      {leases.map((lease) => (
                        <option key={lease.id} value={lease.id}>
                          {lease.tenantName} • {lease.propertyName} (ID: {lease.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="paymentType" className="form-label">
                      Payment Type
                    </label>
                    <select
                      className="form-select w-100"
                      id="paymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(Number(e.target.value) as PaymentType)}
                      required
                    >
                      <option value={PaymentType.Rent}>Rent</option>
                      <option value={PaymentType.Levy}>Levy</option>
                      <option value={PaymentType.Bond}>Bond</option>
                      <option value={PaymentType.Other}>Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
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
                      placeholder="e.g. 8500.00"
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

export default RecordPayment;