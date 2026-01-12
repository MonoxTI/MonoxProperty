// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Nav';

interface LoginDto {
  email: string;
  password: string;
}

// Handle both "token" and "jwt" responses from backend
interface LoginResponse {
  token?: string;
  jwt?: string;
  message?: string;
  // Add other fields if your backend returns them
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5153/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Handle non-OK responses with detailed errors
      if (!response.ok) {
        let errorMessage = `Login failed (${response.status})`;
        
        try {
          // Try to parse error details from backend
          const errorData = await response.json();
          errorMessage = 
            errorData.message || 
            errorData.Message || 
            errorData.title || 
            errorData.error || 
            errorMessage;
        } catch (parseError) {
          // If response isn't JSON (e.g., HTML error page), use status text
          console.warn('Non-JSON error response:', await response.text());
          errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data: LoginResponse = await response.json();
      console.log('Login response:', data);
      
      // Extract token (support both "token" and "jwt" fields)
      const token = data.token || data.jwt;
      
      if (token) {
        localStorage.setItem('token', token);
        console.log('Authentication token saved successfully');
        navigate('/home');
      } else {
        throw new Error('Authentication succeeded but no token was returned. Check your API response structure.');
      }
      
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
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