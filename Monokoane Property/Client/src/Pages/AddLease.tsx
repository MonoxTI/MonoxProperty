// src/Pages/AddLease.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface PropertyDto { id: number; propertyName: string; }
interface TenantDto { id: number; fullName: string; email: string; }

const AddLease: React.FC = () => {
  const [propertyId, setPropertyId] = useState<number | ''>('');
  const [tenantId, setTenantId] = useState<number | ''>('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [rent, setRent] = useState('');
  const [levy, setLevy] = useState('');
  const [bond, setBond] = useState('');
  const [rates, setRates] = useState('');
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/property'), api.get('/tenant')])
      .then(([pRes, tRes]) => { setProperties(pRes.data); setTenants(tRes.data); })
      .catch(() => setError('Failed to load properties or tenants. Please refresh.'))
      .finally(() => setIsLoadingData(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (propertyId === '') return setError('Please select a property');
    if (tenantId === '') return setError('Please select a tenant');
    const rentNum = parseFloat(rent), levyNum = parseFloat(levy), bondNum = parseFloat(bond), ratesNum = parseFloat(rates);
    if (isNaN(rentNum) || rentNum <= 0) return setError('Rent must be a positive amount');
    if (isNaN(levyNum) || levyNum < 0) return setError('Levy must be zero or positive');
    if (isNaN(bondNum) || bondNum < 0) return setError('Bond must be zero or positive');
    if (isNaN(ratesNum) || ratesNum < 0) return setError('Rates must be zero or positive');
    if (!start) return setError('Start date is required');
    if (!end) return setError('End date is required');
    if (new Date(end) < new Date(start)) return setError('End date cannot be before start date');

    try {
      setLoading(true);
      await api.post('/lease/add', {
        propertyId, tenantId,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        rent: rentNum, levy: levyNum, bond: bondNum, rates: ratesNum
      });
      setSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create lease.');
    } finally { setLoading(false); }
  };

  if (isLoadingData) return (
    <div className="container-fluid mt-5 text-center">
      <div className="spinner-border" role="status" /><p className="mt-2">Loading...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-5">
      <Navigation />
      <div className="row"><div className="col-12">
        <div className="card shadow-sm"><div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold">Add New Lease</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success"><h5 className="mb-2">Lease Created Successfully!</h5><p className="mb-0">Redirecting...</p></div>}
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
                <label className="form-label">Tenant</label>
                <select className="form-select w-100" value={tenantId} onChange={e => setTenantId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Select a tenant --</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName} (ID: {t.id})</option>)}
                </select>
              </div>
              {[{ id: 'start', label: 'Start Date', type: 'date', val: start, set: setStart },
                { id: 'end', label: 'End Date', type: 'date', val: end, set: setEnd }].map(({ id, label, type, val, set }) => (
                <div className="mb-3" key={id}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-control w-100" value={val} onChange={e => set(e.target.value)} required />
                </div>
              ))}
              {[{ label: 'Monthly Rent (R)', val: rent, set: setRent, ph: '8500.00', min: '0.01' },
                { label: 'Monthly Levy (R)', val: levy, set: setLevy, ph: '950.00', min: '0' },
                { label: 'Deposit / Bond (R)', val: bond, set: setBond, ph: '17000.00', min: '0' },
                { label: 'Monthly Rates (R)', val: rates, set: setRates, ph: '1200.00', min: '0' }].map(({ label, val, set, ph, min }) => (
                <div className="mb-3" key={label}>
                  <label className="form-label">{label}</label>
                  <input type="number" className="form-control w-100" value={val} onChange={e => set(e.target.value)} min={min} step="0.01" required placeholder={ph} />
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating Lease...</> : 'Create Lease'}
              </button>
            </form>
          )}
        </div></div>
      </div></div>
    </div>
  );
};

export default AddLease;