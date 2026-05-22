// src/Pages/DeleteProp.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface PropertyDto { id: number; propertyName: string; location: string; apartments: boolean; units: number; occupied: boolean; leases: any[]; expenses: any[]; }

const PropertiesManagement: React.FC = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [errorProperties, setErrorProperties] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/property');
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorProperties(err?.response?.data?.message || 'Failed to load properties.');
    } finally { setLoadingProperties(false); }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return setErrorSearch('Please enter a property name');
    setLoadingSearch(true); setErrorSearch(null); setProperty(null); setDeleteSuccess(null);
    try {
      const res = await api.post('/property/byname', { propertyName: searchName.trim() });
      setProperty(res.data);
    } catch (err: any) {
      setErrorSearch(err?.response?.status === 404 ? 'Property not found' : err?.message || 'Failed to fetch property');
    } finally { setLoadingSearch(false); }
  };

  const handleDelete = async () => {
    if (!property || !window.confirm(`Delete "${property.propertyName}"? This cannot be undone.`)) return;
    setDeleteLoading(true); setErrorSearch(null); setDeleteSuccess(null);
    try {
      await api.delete(`/property/${property.propertyName}`);
      setDeleteSuccess(`Property "${property.propertyName}" deleted successfully.`);
      setProperty(null); setSearchName('');
      setTimeout(fetchProperties, 1000);
    } catch (err: any) {
      setErrorSearch(err?.response?.data?.message || 'Failed to delete property.');
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="container mt-4">
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Property Management</h2>
        <Link to="/add-property" className="btn btn-primary">Add Property</Link>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3"><h5 className="mb-0">All Properties ({properties.length})</h5></div>
            <div className="card-body p-0">
              {errorProperties && <div className="alert alert-danger m-3">{errorProperties}</div>}
              {loadingProperties ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading...</p></div>
              ) : properties.length === 0 ? (
                <div className="text-center py-5"><p className="mb-3">No properties found.</p><Link to="/add-property" className="btn btn-primary">Add Your First Property</Link></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>ID</th><th>Name</th><th>Location</th><th>Units</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {properties.map(p => (
                        <tr key={p.id} className="align-middle">
                          <td>#{p.id}</td>
                          <td>{p.propertyName}</td>
                          <td>{p.location}</td>
                          <td>{p.units}</td>
                          <td>{p.apartments ? 'Apartments' : 'Single Unit'}</td>
                          <td><span className={`badge ${p.occupied ? 'bg-success' : 'bg-secondary'}`}>{p.occupied ? 'Occupied' : 'Vacant'}</span></td>
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
            <div className="card-header bg-white py-3"><h5 className="mb-0">Find & Delete Property</h5></div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Enter property name"
                    value={searchName} onChange={e => setSearchName(e.target.value)} disabled={loadingSearch || deleteLoading} />
                  <button className="btn btn-primary" type="submit" disabled={loadingSearch || deleteLoading}>
                    {loadingSearch ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              {errorSearch && <div className="alert alert-danger">{errorSearch}</div>}
              {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
              {property && !deleteSuccess && (
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">{property.propertyName}</h6>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? <><span className="spinner-border spinner-border-sm me-1" />Deleting...</> : 'Delete'}
                    </button>
                  </div>
                  {[['Location', property.location], ['Units', property.units], ['Type', property.apartments ? 'Apartments' : 'Single Unit']].map(([k, v]) => (
                    <p className="mb-1" key={String(k)}><strong>{k}:</strong> {v}</p>
                  ))}
                  <p className="mb-1"><strong>Status:</strong> <span className={`badge ms-2 ${property.occupied ? 'bg-success' : 'bg-warning'}`}>{property.occupied ? 'Occupied' : 'Vacant'}</span></p>
                  <div className="mt-3 pt-2 border-top"><small className="text-muted">Leases: {property.leases?.length || 0} | Expenses: {property.expenses?.length || 0}</small></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesManagement;