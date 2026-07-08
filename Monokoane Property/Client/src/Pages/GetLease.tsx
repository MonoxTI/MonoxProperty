// src/Pages/GetLease.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface LeaseDto { id: number; propertyId: number; tenantId: number; start: string; end: string; rent: number; levy: number; bond: number; }

const LeasesManagement: React.FC = () => {
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [errorLeases, setErrorLeases] = useState<string | null>(null);
  const [leaseId, setLeaseId] = useState('');
  const [lease, setLease] = useState<LeaseDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      const res = await api.get('/api/lease');
      setLeases(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorLeases(err?.response?.data?.message || 'Failed to load leases.');
    } finally { setLoadingLeases(false); }
  };

  useEffect(() => { fetchLeases(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(leaseId);
    if (isNaN(id) || id <= 0) return setErrorSearch('Please enter a valid lease ID');
    setLoadingSearch(true); setErrorSearch(null); setLease(null); setDeleteSuccess(null);
    try {
      const res = await api.get(`/api/lease/${id}`);
      setLease(res.data);
    } catch (err: any) {
      setErrorSearch(err?.response?.status === 404 ? 'Lease not found' : err?.message || 'Failed to load lease');
    } finally { setLoadingSearch(false); }
  };

  const handleDelete = async () => {
    if (!lease || !window.confirm(`Delete Lease #${lease.id}? This cannot be undone.`)) return;
    setDeleteLoading(true); setErrorSearch(null); setDeleteSuccess(null);
    try {
      await api.delete(`/api/lease/${lease.id}`);
      setDeleteSuccess(`Lease #${lease.id} deleted successfully.`);
      setLease(null); setLeaseId('');
      setTimeout(fetchLeases, 1000);
    } catch (err: any) {
      setErrorSearch(err?.response?.data?.message || 'Failed to delete lease.');
    } finally { setDeleteLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-ZA');

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Lease Management</h2>
        <Link to="/add-lease" className="btn btn-primary">Add Lease</Link>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">All Leases ({leases.length})</h5></div>
            <div className="card-body p-0">
              {errorLeases && <div className="alert alert-danger m-3">{errorLeases}</div>}
              {loadingLeases ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
              ) : leases.length === 0 ? (
                <div className="text-center py-4"><p>No leases found.</p><Link to="/add-lease" className="btn btn-outline-primary mt-2">Create your first lease</Link></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>ID</th><th>Property ID</th><th>Tenant ID</th><th>Start</th><th>End</th><th>Rent</th><th>Levy</th><th>Bond</th></tr>
                    </thead>
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
        </div>
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">Find & Delete Lease</h5></div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input type="number" className="form-control" placeholder="Enter lease ID"
                    value={leaseId} onChange={e => setLeaseId(e.target.value)} min="1" required disabled={loadingSearch || deleteLoading} />
                  <button className="btn btn-primary" type="submit" disabled={loadingSearch || deleteLoading}>
                    {loadingSearch ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              {errorSearch && <div className="alert alert-danger">{errorSearch}</div>}
              {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
              {lease && !deleteSuccess && (
                <div className="border rounded p-3">
                  <h6 className="text-center mb-3">Lease #{lease.id}</h6>
                  <div className="row g-2 mb-3">
                    {[['Property ID', `#${lease.propertyId}`], ['Tenant ID', `#${lease.tenantId}`], ['Start', fmtDate(lease.start)], ['End', fmtDate(lease.end)], ['Rent', fmt(lease.rent)], ['Levy', fmt(lease.levy)], ['Bond', fmt(lease.bond)]].map(([k, v]) => (
                      <div className="col-12" key={k}><div className="d-flex justify-content-between"><strong>{k}:</strong><span>{v}</span></div></div>
                    ))}
                  </div>
                  <div className="pt-2 border-top">
                    <button className="btn btn-danger w-100" onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : 'Delete Lease'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeasesManagement;