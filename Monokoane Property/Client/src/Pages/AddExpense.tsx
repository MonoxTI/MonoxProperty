// src/Pages/AddExpense.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface PropertyDto { id: number; propertyName: string; }

const AddExpense: React.FC = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [propertyId, setPropertyId] = useState<number | ''>('');
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/property')
      .then(res => setProperties(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load properties. Please refresh.'))
      .finally(() => setIsLoadingData(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (propertyId === '') return setError('Please select a property');
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return setError('Amount must be a positive number');
    if (!date) return setError('Date is required');

    try {
      setLoading(true);
      await api.post('/api/expense', { propertyId, description, amount: amountNum, date: new Date(date).toISOString() });
      setSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to add expense.');
    } finally { setLoading(false); }
  };

  if (isLoadingData) return (
    <div className="container-fluid mt-5 text-center">
      <div className="spinner-border" role="status" /><p className="mt-2">Loading properties...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-5">
      <Navigation />
      <div className="row"><div className="col-12">
        <div className="card shadow-sm"><div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold">Add New Expense</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success"><h5 className="mb-2">Expense Added Successfully!</h5><p className="mb-0">Redirecting...</p></div>}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Property</label>
                <select className="form-select w-100" value={propertyId} onChange={e => setPropertyId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Select a property --</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName} (ID: {p.id})</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input type="text" className="form-control w-100" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Water bill, Roof repair" />
              </div>
              <div className="mb-3">
                <label className="form-label">Amount (R)</label>
                <input type="number" className="form-control w-100" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" required placeholder="e.g. 450.75" />
              </div>
              <div className="mb-4">
                <label className="form-label">Date</label>
                <input type="date" className="form-control w-100" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Add Expense'}
              </button>
            </form>
          )}
        </div></div>
      </div></div>
    </div>
  );
};

export default AddExpense;