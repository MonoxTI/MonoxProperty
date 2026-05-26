// src/Pages/AllProp.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/axios';

interface PropertyDto {
  id: number;
  propertyName: string;
  location: string;
  apartments: boolean;
  units: number;
  occupied: boolean;
  unitsList?: any[];
}

const AllProperties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/property')
      .then(res => setProperties(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load properties.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Properties</h2>
        <Link to="/add-property" className="btn btn-primary">Add Property</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading...</p></div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {properties.length === 0 ? (
              <div className="text-center py-5"><p className="mb-3">No properties found.</p><Link to="/add-property" className="btn btn-primary">Add Your First Property</Link></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light"><tr><th>ID</th><th>Name</th><th>Location</th><th>Units</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {properties.map(p => (
  <React.Fragment key={p.id}>
    <tr className="align-middle">
      <td>#{p.id}</td>
      <td><strong>{p.propertyName}</strong></td>
      <td>{p.location}</td>
      <td>{p.units}</td>
      <td>{p.apartments ? 'Apartments' : 'Single Unit'}</td>
      <td><span className={`badge ${p.occupied ? 'bg-success' : 'bg-secondary'}`}>{p.occupied ? 'Occupied' : 'Vacant'}</span></td>
    </tr>
    {/* Show units indented below parent */}
    {p.unitsList?.map((unit: any) => (
      <tr key={unit.id} className="align-middle table-light">
        <td className="ps-4 text-muted">↳ #{unit.id}</td>
        <td className="ps-4 text-muted">{unit.propertyName}</td>
        <td className="text-muted">{unit.location}</td>
        <td>—</td>
        <td><span className="badge bg-light text-dark">Unit</span></td>
        <td><span className={`badge ${unit.occupied ? 'bg-success' : 'bg-secondary'}`}>{unit.occupied ? 'Occupied' : 'Vacant'}</span></td>
      </tr>
    ))}
  </React.Fragment>
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

export default AllProperties;