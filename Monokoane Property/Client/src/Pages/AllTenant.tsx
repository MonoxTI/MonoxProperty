// src/Pages/AllTenant.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/axios';

interface Tenant { id: number; fullName: string; email: string; phoneNumber: string; }

const AllTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/tenant')
      .then(res => setTenants(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tenants.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPhone = (phone: string) => {
    let c = phone.replace(/[^\d+]/g, '');
    if (c.startsWith('+27') && c.length === 12) return `+27 ${c.slice(3,5)} ${c.slice(5,8)} ${c.slice(8)}`;
    if (c.startsWith('0') && c.length === 10) return `${c.slice(0,3)} ${c.slice(3,6)} ${c.slice(6)}`;
    return phone;
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Tenants</h2>
        <Link to="/add-tenant" className="btn btn-primary">Add Tenant</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading tenants...</p></div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {tenants.length === 0 ? (
              <div className="text-center py-5"><p className="mb-3">No tenants found.</p><Link to="/add-tenant" className="btn btn-primary">Add Your First Tenant</Link></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light"><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Phone</th></tr></thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t.id} className="align-middle">
                        <td>#{t.id}</td><td>{t.fullName}</td>
                        <td><a href={`mailto:${t.email}`} className="text-decoration-none">{t.email}</a></td>
                        <td><a href={`tel:${t.phoneNumber}`} className="text-decoration-none">{formatPhone(t.phoneNumber)}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTenants;