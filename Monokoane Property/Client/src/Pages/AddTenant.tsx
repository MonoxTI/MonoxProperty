// src/components/AddTenant.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TenantDto {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface ApiErrorResponse {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
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

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // South African number pattern: +27 or 0 followed by 9 digits
    const saPhoneRegex = /^(\+27|0)\d{9}$/;
    if (!saPhoneRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid South African phone number (e.g., +27821234567 or 0821234567)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5153/api/tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData)
      });

      const text = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to create tenant (${res.status})`;
        try {
          if (text.trim()) {
            const errorData = JSON.parse(text) as ApiErrorResponse;
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch {
          console.warn('Non-JSON error response:', text.substring(0, 200));
          errorMessage = `Server error: ${res.status} ${res.statusText || ''}`;
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      // Redirect after success (or reset form)
      setTimeout(() => navigate('/tenants'), 2000);
    } catch (err: any) {
      console.error('Tenant creation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">Add New Tenant</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <h5 className="mb-2">Tenant Added Successfully!</h5>
                  <p className="mb-0">Redirecting to tenants list...</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control w-100"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control w-100"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control w-100"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                   </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding Tenant...
                      </>
                    ) : (
                      'Add Tenant'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;