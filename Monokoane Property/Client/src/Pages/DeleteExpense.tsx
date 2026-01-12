// src/components/ExpenseLookupDelete.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';

// Match your C# ExpenseDto
interface ExpenseDto {
  id: number;
  propertyId: number;
  description: string;
  amount: number;
  date: string; // ISO date string
}

const ExpenseLookupDelete: React.FC = () => {
  const [searchId, setSearchId] = useState<string>("");
  const [expense, setExpense] = useState<ExpenseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const idNum = Number(searchId.trim());
    if (!idNum || idNum <= 0 || !Number.isInteger(idNum)) {
      setError("Please enter a valid expense ID (positive whole number)");
      return;
    }

    setLoading(true);
    setError(null);
    setExpense(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5153/api/expense/${idNum}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (response.status === 404) {
        throw new Error("Expense not found");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setExpense(data as ExpenseDto);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;

    if (!window.confirm(`Are you sure you want to delete Expense #${expense.id}? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5153/api/expense/${expense.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        const text = await response.text();
        let message = `Failed to delete expense (${response.status})`;
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

      setDeleteSuccess(`Expense #${expense.id} has been deleted successfully.`);
      setExpense(null);
      setSearchId("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date as DD/MM/YYYY (South African format)
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA');
  };

  // Format currency as R1,234.50
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <h2 className="mb-4">Expense Lookup & Delete</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            placeholder="Enter expense ID (e.g., 1, 2, 3...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            min="1"
            disabled={loading || deleteLoading}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading || deleteLoading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Delete Success Message */}
      {deleteSuccess && (
        <div className="alert alert-success">
          {deleteSuccess}
        </div>
      )}

      {/* Expense Result */}
      {expense && !deleteSuccess && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Expense #{expense.id}</h3>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Deleting...
                </>
              ) : (
                "Delete Expense"
              )}
            </button>
          </div>
          <div className="card-body">
            <p><strong>Description:</strong> {expense.description}</p>
            <p><strong>Amount:</strong> {formatCurrency(expense.amount)}</p>
            <p><strong>Date:</strong> {formatDate(expense.date)}</p>
            <p><strong>Property ID:</strong> 
              <Link to={`/properties/${expense.propertyId}`} className="ms-1">
                #{expense.propertyId}
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseLookupDelete;