// src/Pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Nav';
import api from '../API/axios';

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  jwt?: string;
  message?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginDto>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', formData);

      const token = data.token || data.jwt;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/home');
      } else {
        throw new Error('Login succeeded but no token was returned.');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Login</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="mb-1 text-muted">Don't have an account?</p>
            <a href="/register" className="text-decoration-none fw-semibold">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;