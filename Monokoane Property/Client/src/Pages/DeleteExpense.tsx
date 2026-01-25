// src/components/ExpensesManagement.tsx
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

const ExpensesManagement: React.FC = () => {
  // State for All Expenses
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [errorExpenses, setErrorExpenses] = useState<string | null>(null);

  // State for Lookup & Delete
  const [expenseId, setExpenseId] = useState<string>('');
  const [expense, setExpense] = useState<ExpenseDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Fetch all properties for display
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Fetch all expenses and properties on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [expensesRes, propertiesRes] = await Promise.all([
          fetch('http://localhost:5153/api/expense/All', { headers }),
          fetch('http://localhost:5153/api/property', { headers })
        ]);

        if (!expensesRes.ok) throw new Error(`Failed to load expenses (${expensesRes.status})`);
        if (!propertiesRes.ok) throw new Error(`Failed to load properties (${propertiesRes.status})`);

        const expensesData = await expensesRes.json();
        const propertiesData = await propertiesRes.json();

        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      } catch (err: any) {
        console.error('Fetch all data error:', err);
        setErrorExpenses(err.message || 'Failed to load data.');
      } finally {
        setLoadingExpenses(false);
        setLoadingProperties(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle expense search by ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = Number(expenseId);
    if (isNaN(id) || id <= 0) {
      setErrorSearch('Please enter a valid expense ID (number > 0)');
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setExpense(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`http://localhost:5153/api/expense/${id}`, { headers });

      if (response.status === 404) {
        throw new Error('Expense not found');
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setExpense(data as ExpenseDto);
    } catch (err: any) {
      console.error('Expense fetch error:', err);
      setErrorSearch(err.message || 'Failed to load expense');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle expense delete
  const handleDelete = async () => {
    if (!expense) return;

    if (!window.confirm(`Are you sure you want to delete Expense #${expense.id}? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setErrorSearch(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`http://localhost:5153/api/expense/${expense.id}`, {
        method: 'DELETE',
        headers,
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
      setExpenseId('');

      // Refresh expenses list
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch('http://localhost:5153/api/expense/All', { headers });
          if (res.ok) {
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Refresh expenses error:', err);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorSearch(err.message || 'Failed to delete expense.');
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

  // Get property name by ID
  const getPropertyName = (propertyId: number): string => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.propertyName : `Property #${propertyId}`;
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Expense Management</h2>
        <Link to="/add-expense" className="btn btn-primary">
          Add Expense
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Card: All Expenses Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">All Expenses ({expenses.length})</h5>
            </div>
            <div className="card-body p-0">
              {errorExpenses && (
                <div className="alert alert-danger m-3" role="alert">
                  {errorExpenses}
                </div>
              )}

              {loadingExpenses ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading expenses...</p>
                </div>
              ) : (
                <>
                  {expenses.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="64"
                          height="64"
                          fill="currentColor"
                          className="bi bi-cash-coin text-muted"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/>
                          <path d="M9.438 11.944c.047.596.518 1.066 1.072 1.066.555 0 1.026-.47 1.072-1.066l.005-.278c.004-.24-.008-.48-.035-.718l-.014-.127c-.018-.16-.036-.321-.063-.481l-.027-.162c-.025-.15-.055-.3-.09-.448l-.038-.152c-.03-.12-.065-.24-.105-.358l-.043-.128c-.035-.105-.075-.21-.12-.313l-.05-.107c-.04-.086-.085-.172-.135-.257l-.057-.096c-.045-.076-.095-.152-.15-.226l-.064-.085c-.05-.067-.105-.133-.165-.198l-.073-.077c-.06-.063-.125-.125-.195-.185l-.082-.07c-.065-.055-.135-.11-.21-.163l-.09-.062c-.07-.048-.145-.095-.225-.14l-.1-.055c-.08-.044-.165-.087-.255-.128l-.11-.05c-.09-.04-.185-.078-.285-.114l-.12-.043c-.1-.035-.205-.068-.315-.1l-.13-.036c-.11-.03-.225-.058-.345-.084l-.14-.028c-.12-.023-.245-.044-.375-.062l-.15-.02c-.13-.016-.265-.03-.405-.042l-.16-.012c-.14-.01-.285-.018-.435-.024l-.17-.006c-.15-.004-.305-.006-.465-.006H3.5c-.16 0-.315.002-.465.006l-.17.006c-.15.006-.295.014-.435.024l-.16.012c-.14.012-.275.026-.405.042l-.15.02c-.13.018-.255.039-.375.062l-.14.028c-.12.026-.235.054-.345.084l-.13.036c-.11.032-.215.065-.315.1l-.12.043c-.1.036-.195.074-.285.114l-.11.05c-.09.041-.175.084-.255.128l-.1.055c-.08.045-.155.092-.225.14l-.09.062c-.07.053-.135.108-.195.163l-.082.07c-.07.06-.135.122-.195.185l-.073.077c-.06.065-.115.131-.165.198l-.064.085c-.055.074-.105.15-.15.226l-.057.096c-.045.103-.085.208-.12.313l-.043.128c-.04.118-.075.238-.105.358l-.038.152c-.025.15-.055.3-.09.448l-.027.162c-.027.16-.045.321-.063.481l-.014.127c-.027.238-.039.478-.035.718l.005.278c.046.596.517 1.066 1.071 1.066.555 0 1.026-.47 1.072-1.066l.005-.278c.004-.24-.008-.48-.035-.718l-.014-.127c-.018-.16-.036-.321-.063-.481l-.027-.162c-.025-.15-.055-.3-.09-.448l-.038-.152c-.03-.12-.065-.24-.105-.358l-.043-.128c-.035-.105-.075-.21-.12-.313l-.05-.107c-.04-.086-.085-.172-.135-.257l-.057-.096c-.045-.076-.095-.152-.15-.226l-.064-.085c-.05-.067-.105-.133-.165-.198l-.073-.077c-.06-.063-.125-.125-.195-.185l-.082-.07c-.065-.055-.135-.11-.21-.163l-.09-.062c-.07-.048-.145-.095-.225-.14l-.1-.055c-.08-.044-.165-.087-.255-.128l-.11-.05c-.09-.04-.185-.078-.285-.114l-.12-.043c-.1-.035-.205-.068-.315-.1l-.13-.036c-.11-.03-.225-.058-.345-.084l-.14-.028c-.12-.023-.245-.044-.375-.062l-.15-.02c-.13-.016-.265-.03-.405-.042l-.16-.012c-.14-.01-.285-.018-.435-.024l-.17-.006c-.15-.004-.305-.006-.465-.006H3.5c-.16 0-.315.002-.465.006l-.17.006c-.15.006-.295.014-.435.024l-.16.012c-.14.012-.275.026-.405.042l-.15.02c-.13.018-.255.039-.375.062l-.14.028c-.12.026-.235.054-.345.084l-.13.036c-.11.032-.215.065-.315.1l-.12.043c-.1.036-.195.074-.285.114l-.11.05c-.09.041-.175.084-.255.128l-.1.055c-.08.045-.155.092-.225.14l-.09.062c-.07.053-.135.108-.195.163l-.082.07c-.07.06-.135.122-.195.185l-.073.077c-.06.065-.115.131-.165.198l-.064.085c-.055.074-.105.15-.15.226l-.057.096c-.045.103-.085.208-.12.313l-.043.128c-.04.118-.075.238-.105.358l-.038.152c-.025.15-.055.3-.09.448l-.027.162c-.027.16-.045.321-.063.481l-.014.127c-.027.238-.039.478-.035.718l.005.278c.046.596.517 1.066 1.071 1.066.555 0 1.026-.47 1.072-1.066z"/>
                        </svg>
                      </div>
                      <p className="mb-3">No expenses found.</p>
                      <Link to="/add-expense" className="btn btn-primary">
                        Add Your First Expense
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Property</th>
                            <th>Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id}>
                              <td>#{expense.id}</td>
                              <td>{expense.description}</td>
                              <td>
                                <Link to={`/properties/${expense.propertyId}`} className="text-decoration-none">
                                  {getPropertyName(expense.propertyId)}
                                </Link>
                              </td>
                              <td>{formatCurrency(expense.amount)}</td>
                              <td>{formatDate(expense.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Lookup & Delete */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Find & Delete Expense</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter expense ID"
                    value={expenseId}
                    onChange={(e) => setExpenseId(e.target.value)}
                    min="1"
                    disabled={loadingSearch || deleteLoading}
                    required
                  />
                  <button 
                    className="btn btn-primary"
                    type="submit"
                    disabled={loadingSearch || deleteLoading}
                  >
                    {loadingSearch ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              {/* Search Error */}
              {errorSearch && (
                <div className="alert alert-danger" role="alert">
                  {errorSearch}
                </div>
              )}

              {/* Delete Success */}
              {deleteSuccess && (
                <div className="alert alert-success" role="alert">
                  {deleteSuccess}
                </div>
              )}

              {/* Expense Details */}
              {expense && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="text-center mb-3">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                      style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                      💰
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>ID:</strong>
                        <span className="text-primary">#{expense.id}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Description:</strong>
                        <span>{expense.description}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Amount:</strong>
                        <span>{formatCurrency(expense.amount)}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Date:</strong>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <strong>Property:</strong>
                        <Link to={`/properties/${expense.propertyId}`} className="text-decoration-none">
                          {getPropertyName(expense.propertyId)}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-top">
                    <button
                      className="btn btn-danger w-100"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Deleting...
                        </>
                      ) : (
                        'Delete Expense'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!expense && !deleteSuccess && !errorSearch && (
                <div className="text-center text-muted py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="mt-2 mb-0">Search for an expense to manage</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesManagement;