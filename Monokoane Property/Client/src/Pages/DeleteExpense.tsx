// src/components/ExpenseLookupDelete.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';

interface ExpenseDto {
  id: number;
  propertyId: number;
  description: string;
  amount: number;
  date: string;
}

interface PropertyDto {
  id: number;
  propertyName: string;
}

const ExpenseLookupDelete: React.FC = () => {
  const [searchId, setSearchId] = useState<string>("");
  const [searchPropertyId, setSearchPropertyId] = useState<string>("");
  const [expense, setExpense] = useState<ExpenseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Fetch all properties for dropdown
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch('http://localhost:5153/api/property', { headers });
        if (response.ok) {
          const data = await response.json();
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const idNum = Number(searchId.trim());
    if (!idNum || idNum <= 0 || !Number.isInteger(idNum)) {
      setError("Please enter a valid expense ID");
      return;
    }

    await fetchExpenseById(idNum);
  };

  const handleSearchByProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const propertyIdNum = Number(searchPropertyId.trim());
    if (!propertyIdNum || propertyIdNum <= 0 || !Number.isInteger(propertyIdNum)) {
      setError("Please select a valid property");
      return;
    }

    await fetchExpenseByProperty(propertyIdNum);
  };

  const fetchExpenseById = async (id: number) => {
    setLoading(true);
    setError(null);
    setExpense(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5153/api/expense/${id}`, {
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

  const fetchExpenseByProperty = async (propertyId: number) => {
    setLoading(true);
    setError(null);
    setExpense(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5153/api/expense/property/${propertyId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });

      if (response.status === 404) {
        throw new Error("No expenses found for this property");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Assuming API returns single expense or first expense
      const expenseData = Array.isArray(data) ? data[0] : data;
      setExpense(expenseData as ExpenseDto);
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
      setSearchPropertyId("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date as DD/MM/YYYY
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
      
      {/* Search by Expense ID */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Search by Expense ID</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearchById}>
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
                {loading && !searchPropertyId ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search by Property */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Search by Property</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearchByProperty}>
            <div className="mb-3">
              <label className="form-label">Select Property</label>
              <select
                className="form-select"
                value={searchPropertyId}
                onChange={(e) => setSearchPropertyId(e.target.value)}
                disabled={loadingProperties || loading || deleteLoading}
                required
              >
                <option value="">-- Select a property --</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.propertyName} (ID: {property.id})
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="btn btn-primary w-100"
              type="submit"
              disabled={loadingProperties || loading || deleteLoading}
            >
              {loading && searchPropertyId ? "Searching..." : "Find Expense"}
            </button>
          </form>
        </div>
      </div>

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
            <p><strong>Property:</strong> 
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