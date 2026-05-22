// src/Pages/AllLease.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/axios';

interface LeaseDto { id: number; propertyId: number; tenantId: number; start: string; end: string; rent: number; levy: number; bond: number; }

const LeasesList: React.FC = () => {
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/lease')
      .then(res => setLeases(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load leases.'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-ZA');

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Leases</h2>
        <Link to="/add-lease" className="btn btn-primary">Add Lease</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading leases...</p></div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {leases.length === 0 ? (
              <div className="text-center py-4"><p className="mb-0">No leases found.</p><Link to="/add-lease" className="btn btn-outline-primary mt-2">Create your first lease</Link></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light"><tr><th>ID</th><th>Property ID</th><th>Tenant ID</th><th>Start</th><th>End</th><th>Rent</th><th>Levy</th><th>Bond</th></tr></thead>
                  <tbody>
                    {leases.map(l => (
                      <tr key={l.id}>
                        <td>#{l.id}</td><td>#{l.propertyId}</td><td>#{l.tenantId}</td>
                        <td>{fmtDate(l.start)}</td><td>{fmtDate(l.end)}</td>
                        <td>{fmt(l.rent)}</td><td>{fmt(l.levy)}</td><td>{fmt(l.bond)}</td>
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

export default LeasesList;