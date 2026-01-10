// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterDto>({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5153/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="alert alert-success text-center py-4" role="alert">
              <h4 className="mb-2">Registration Successful!</h4>
              <p className="mb-0">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">Register</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control w-100"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control w-100"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control w-100"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    autoComplete="new-password"
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
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              <div className="mt-3 text-center">
                <p className="mb-1">Already have an account?</p>
                <a href="/login" className="text-decoration-none">Login here</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;