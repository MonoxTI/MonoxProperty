// src/components/AddTenant.tsx
import React, { useState } from 'react';

interface TenantDto {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const AddTenant: React.FC = () => {
  const [formData, setFormData] = useState<TenantDto>({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5153/api/tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your JWT token if needed:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create tenant');
      }

      setSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({ fullName: '', email: '', phoneNumber: '' });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Tenant creation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
              className="bi bi-person-plus me-2" viewBox="0 0 16 16">
              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 0 4zm-1-.004c-.001-.246-.154-.487-.407-.636C10.876 11.225 10.395 11 10 11c-.4 0-.8.2-.972.5h-.028a.5.5 0 0 1-.5-.5z"/>
              <path d="M13.5 1a.5.5 0 0 1 .5.5V2h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0V3h-1a.5.5 0 0 1 0-1h1V1.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
            Add New Tenant
          </h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <div className="d-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" 
                  className="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
                  <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06A.129.129 0 0 1 15 13.999a.135.135 0 0 1-.002-.017-.145.145 0 0 1-.023-.036.148.148 0 0 1-.024-.037c-.054-.116-.116-.224-.184-.327a.17.17 0 0 1-.002-.184l.001-.002z"/>
                  <path d="M8 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
                <div>{error}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" 
                  className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06l2.094 2.093a.75.75 0 0 0 1.06 0l3.71-3.71a.75.75 0 0 0-.022-1.08z"/>
                </svg>
                <div>Tenant created successfully!</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john@example.com"
                required
              />
              <div className="form-text">We'll never share your email with anyone else.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="phoneNumber" className="form-label fw-bold">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g., +27 123 456 7890"
                required
              />
              <div className="form-text">Include country code (e.g., +27 for South Africa)</div>
            </div>

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  'Add Tenant'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-3 text-center text-muted small">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
            className="bi bi-info-circle me-1" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8.93 6.588l-2.29.924L5.38 5.24a1 1 0 0 1 1.414-1.414l1.82 1.819 1.82-1.82a1 1 0 0 1 1.414 1.414L10.686 6.5l-1.756.702z"/>
            <path d="M8.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          All fields are required
        </p>
      </div>
    </div>
  );
};

export default AddTenant;