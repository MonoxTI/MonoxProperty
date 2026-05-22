// src/Pages/DeleteExpense.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface ExpenseDto { id: number; propertyId: number; description: string; amount: number; date: string; }
interface PropertyDto { id: number; propertyName: string; }

const ExpensesManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [errorExpenses, setErrorExpenses] = useState<string | null>(null);
  const [expenseId, setExpenseId] = useState('');
  const [expense, setExpense] = useState<ExpenseDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      const [expRes, propRes] = await Promise.all([api.get('/expense/All'), api.get('/property')]);
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
      setProperties(Array.isArray(propRes.data) ? propRes.data : []);
    } catch (err: any) {
      setErrorExpenses(err?.response?.data?.message || 'Failed to load data.');
    } finally { setLoadingExpenses(false); }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(expenseId);
    if (isNaN(id) || id <= 0) return setErrorSearch('Please enter a valid expense ID');
    setLoadingSearch(true); setErrorSearch(null); setExpense(null); setDeleteSuccess(null);
    try {
      const res = await api.get(`/expense/${id}`);
      setExpense(res.data);
    } catch (err: any) {
      setErrorSearch(err?.response?.status === 404 ? 'Expense not found' : err?.message || 'Failed to load expense');
    } finally { setLoadingSearch(false); }
  };

  const handleDelete = async () => {
    if (!expense || !window.confirm(`Delete Expense #${expense.id}? This cannot be undone.`)) return;
    setDeleteLoading(true); setErrorSearch(null); setDeleteSuccess(null);
    try {
      await api.delete(`/expense/${expense.id}`);
      setDeleteSuccess(`Expense #${expense.id} deleted successfully.`);
      setExpense(null); setExpenseId('');
      setTimeout(fetchExpenses, 1000);
    } catch (err: any) {
      setErrorSearch(err?.response?.data?.message || 'Failed to delete expense.');
    } finally { setDeleteLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-ZA');
  const getPropName = (id: number) => properties.find(p => p.id === id)?.propertyName || `Property #${id}`;

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Expense Management</h2>
        <Link to="/add-expense" className="btn btn-primary">Add Expense</Link>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">All Expenses ({expenses.length})</h5></div>
            <div className="card-body p-0">
              {errorExpenses && <div className="alert alert-danger m-3">{errorExpenses}</div>}
              {loadingExpenses ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-5"><p className="mb-3">No expenses found.</p><Link to="/add-expense" className="btn btn-primary">Add Your First Expense</Link></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>ID</th><th>Description</th><th>Property</th><th>Amount</th><th>Date</th></tr></thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e.id}>
                          <td>#{e.id}</td><td>{e.description}</td>
                          <td>{getPropName(e.propertyId)}</td>
                          <td>{fmt(e.amount)}</td><td>{fmtDate(e.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">Find & Delete Expense</h5></div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input type="number" className="form-control" placeholder="Enter expense ID"
                    value={expenseId} onChange={e => setExpenseId(e.target.value)} min="1" required disabled={loadingSearch || deleteLoading} />
                  <button className="btn btn-primary" type="submit" disabled={loadingSearch || deleteLoading}>
                    {loadingSearch ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              {errorSearch && <div className="alert alert-danger">{errorSearch}</div>}
              {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
              {expense && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="row g-2">
                    {[['ID', `#${expense.id}`], ['Description', expense.description], ['Amount', fmt(expense.amount)], ['Date', fmtDate(expense.date)], ['Property', getPropName(expense.propertyId)]].map(([k, v]) => (
                      <div className="col-12" key={String(k)}><div className="d-flex justify-content-between"><strong>{k}:</strong><span>{v}</span></div></div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-top">
                    <button className="btn btn-danger w-100" onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : 'Delete Expense'}
                    </button>
                  </div>
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