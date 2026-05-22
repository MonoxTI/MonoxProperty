// src/Pages/AddTenant.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/axios';

interface TenantDto { fullName: string; email: string; phoneNumber: string; }

const AddTenant: React.FC = () => {
  const [formData, setFormData] = useState<TenantDto>({ fullName: '', email: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const validate = (): boolean => {
    if (!formData.fullName.trim()) { setError('Full name is required'); return false; }
    if (!formData.email.trim()) { setError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email'); return false; }
    if (!formData.phoneNumber.trim()) { setError('Phone number is required'); return false; }
    if (!/^(\+27|0)\d{9}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid South African phone number (e.g. +27821234567 or 0821234567)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setError(null);
    try {
      await api.post('/tenant', formData);
      setSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create tenant.');
    } finally { setLoading(false); }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row"><div className="col-12">
        <div className="card shadow-sm"><div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold">Add New Tenant</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success"><h5 className="mb-2">Tenant Added Successfully!</h5><p className="mb-0">Redirecting...</p></div>}
          {!success && (
            <form onSubmit={handleSubmit}>
              {[{ id: 'fullName', label: 'Full Name', type: 'text' }, { id: 'email', label: 'Email', type: 'email' }, { id: 'phoneNumber', label: 'Phone Number', type: 'tel' }].map(({ id, label, type }) => (
                <div className="mb-3" key={id}>
                  <label htmlFor={id} className="form-label">{label}</label>
                  <input type={type} className="form-control w-100" id={id} name={id}
                    value={(formData as any)[id]} onChange={handleChange} required />
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Adding Tenant...</> : 'Add Tenant'}
              </button>
            </form>
          )}
        </div></div>
      </div></div>
    </div>
  );
};

export default AddTenant;