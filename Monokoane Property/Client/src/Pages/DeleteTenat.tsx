// src/components/DeleteTenant.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteTenant: React.FC = () => {
  const [tenantId, setTenantId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const idNum = Number(tenantId.trim());
    if (!idNum || idNum <= 0 || !Number.isInteger(idNum)) {
      setError("Please enter a valid tenant ID (positive whole number)");
      return;
    }

    setError(null);
    setSuccess(null);
    setShowConfirm(true);
    setConfirmId(idNum);
  };

  const handleDelete = async () => {
    if (confirmId === null) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5153/api/tenant/${confirmId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (response.status === 404) {
        throw new Error("Tenant not found");
      }

      if (!response.ok) {
        // Try to get error message from backend
        const text = await response.text();
        let message = `Failed to delete tenant (${response.status})`;
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text);
            message = errorData.message || errorData.title || message;
          }
        } catch {
          // Keep generic message
        }
        throw new Error(message);
      }

      setSuccess(`Tenant #${confirmId} has been deleted successfully.`);
      setTenantId("");
      setShowConfirm(false);
      setConfirmId(null);

      // Optional: redirect after 2 seconds
      setTimeout(() => navigate("/tenants"), 2000);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete tenant. The tenant may have active leases.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmId(null);
    setTenantId("");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Delete Tenant by ID</h2>
      
      {!showConfirm ? (
        <form onSubmit={handleSearch} className="mb-4">
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              placeholder="Enter tenant ID to delete (e.g., 1, 2, 3...)"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              min="1"
              disabled={loading}
            />
            <button 
              className="btn btn-danger" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching..." : "Delete"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4">
          <div className="alert alert-warning">
            <h5 className="alert-heading">⚠️ Confirm Deletion</h5>
            <p>
              Are you sure you want to delete <strong>Tenant #{confirmId}</strong>?
              This action <strong>cannot be undone</strong> and may affect active leases.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
    </div>
  );
};

export default DeleteTenant;