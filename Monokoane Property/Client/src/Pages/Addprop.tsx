// src/Pages/Addprop.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/axios';

interface CreatePropertyRequest { propertyName: string; location: string; apartments: boolean; units: number; occupied: boolean; }

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('');
  const [apartments, setApartments] = useState(false);
  const [units, setUnits] = useState(0);
  const [occupied, setOccupied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (apartments && units <= 0) { setError('Number of units is required for apartment properties.'); return; }

    try {
      setLoading(true);
      await api.post('/api/property', { propertyName, location, apartments, units: apartments ? units : 0, occupied });
      navigate('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create property.');
    } finally { setLoading(false); }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow"><div className="card-body p-4">
        <h2 className="card-title text-center mb-4">Add New Property</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Property Name</label>
            <input className="form-control" value={propertyName} onChange={e => setPropertyName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <input className="form-control" value={location} onChange={e => setLocation(e.target.value)} required />
          </div>
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" checked={apartments}
              onChange={e => { setApartments(e.target.checked); if (!e.target.checked) setUnits(0); }} />
            <label className="form-check-label">Apartment building?</label>
          </div>
          {apartments && (
            <div className="mb-3">
              <label className="form-label">Number of Units</label>
              <input type="number" className="form-control" min={1} value={units} onChange={e => setUnits(Number(e.target.value))} required />
            </div>
          )}
          <div className="form-check mb-4">
            <input type="checkbox" className="form-check-input" checked={occupied} onChange={e => setOccupied(e.target.checked)} />
            <label className="form-check-label">Mark as currently occupied</label>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => navigate('/home')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-fill" disabled={loading}>{loading ? 'Saving...' : 'Add Property'}</button>
          </div>
        </form>
      </div></div>
    </div>
  );
};

export default AddProperty;