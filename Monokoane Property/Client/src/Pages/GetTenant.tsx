// src/Pages/GetTenant.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface Tenant { id: number; fullName: string; email: string; phoneNumber: string; }

const TenantsManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [errorTenants, setErrorTenants] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenant');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorTenants(err?.response?.data?.message || 'Failed to load tenants.');
    } finally {
      setLoadingTenants(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(tenantId);
    if (isNaN(id) || id <= 0) return setErrorSearch('Please enter a valid tenant ID');
    setLoadingSearch(true); setErrorSearch(null); setTenant(null); setDeleteSuccess(null);
    try {
      const res = await api.get(`/tenant/${id}`);
      setTenant(res.data);
    } catch (err: any) {
      setErrorSearch(err?.response?.status === 404 ? 'Tenant not found' : err?.message || 'Failed to load tenant');
    } finally { setLoadingSearch(false); }
  };

  const handleDelete = async () => {
    if (!tenant || !window.confirm(`Delete "${tenant.fullName}"? This cannot be undone.`)) return;
    setDeleteLoading(true); setErrorSearch(null); setDeleteSuccess(null);
    try {
      await api.delete(`/tenant/${tenant.id}`);
      setDeleteSuccess(`Tenant "${tenant.fullName}" deleted successfully.`);
      setTenant(null); setTenantId('');
      setTimeout(fetchTenants, 1000);
    } catch (err: any) {
      setErrorSearch(err?.response?.data?.message || 'Failed to delete tenant.');
    } finally { setDeleteLoading(false); }
  };

  const formatPhone = (phone: string) => {
    let c = phone.replace(/[^\d+]/g, '');
    if (c.startsWith('+27') && c.length === 12) return `+27 ${c.slice(3,5)} ${c.slice(5,8)} ${c.slice(8)}`;
    if (c.startsWith('0') && c.length === 10) return `${c.slice(0,3)} ${c.slice(3,6)} ${c.slice(6)}`;
    return phone;
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Tenant Management</h2>
        <Link to="/add-tenant" className="btn btn-primary">Add Tenant</Link>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">All Tenants ({tenants.length})</h5></div>
            <div className="card-body p-0">
              {errorTenants && <div className="alert alert-danger m-3">{errorTenants}</div>}
              {loadingTenants ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading tenants...</p></div>
              ) : tenants.length === 0 ? (
                <div className="text-center py-5"><p className="mb-3">No tenants found.</p><Link to="/add-tenant" className="btn btn-primary">Add Your First Tenant</Link></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Phone</th></tr></thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t.id} className="align-middle">
                          <td>#{t.id}</td>
                          <td>{t.fullName}</td>
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
        </div>
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">Find & Delete Tenant</h5></div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input type="number" className="form-control" placeholder="Enter tenant ID"
                    value={tenantId} onChange={e => setTenantId(e.target.value)} min="1" required disabled={loadingSearch || deleteLoading} />
                  <button className="btn btn-primary" type="submit" disabled={loadingSearch || deleteLoading}>
                    {loadingSearch ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              {errorSearch && <div className="alert alert-danger">{errorSearch}</div>}
              {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
              {tenant && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="row g-2">
                    {[['ID', `#${tenant.id}`], ['Name', tenant.fullName], ['Email', tenant.email], ['Phone', formatPhone(tenant.phoneNumber)]].map(([k, v]) => (
                      <div className="col-12" key={k}><div className="d-flex justify-content-between"><strong>{k}:</strong><span>{v}</span></div></div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-top">
                    <button className="btn btn-danger w-100" onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : 'Delete Tenant'}
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

export default TenantsManagement;