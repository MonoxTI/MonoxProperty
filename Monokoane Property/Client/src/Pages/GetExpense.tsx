// src/components/ExpenseById.tsx
import React, { useState } from 'react';

// Match your C# ExpenseDto
interface ExpenseDto {
  id: number;
  propertyId: number;
  description: string;
  amount: number;
  date: string; // ISO date string
}

const ExpenseById: React.FC = () => {
  const [searchId, setSearchId] = useState<string>("");
  const [expense, setExpense] = useState<ExpenseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      <h2 className="mb-4">Search Expense by ID</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            placeholder="Enter expense ID (e.g., 1, 2, 3...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            min="1"
            disabled={loading}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading}
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

      {/* Expense Result */}
      {expense && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Expense #{expense.id}</h3>
          </div>
          <div className="card-body">
            <p><strong>Description:</strong> {expense.description}</p>
            <p><strong>Amount:</strong> {formatCurrency(expense.amount)}</p>
            <p><strong>Date:</strong> {formatDate(expense.date)}</p>
            <p><strong>Property ID:</strong> #{expense.propertyId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseById;