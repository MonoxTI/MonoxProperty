// src/components/HomeDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; 
import Navigation from '../Nav'; 

interface PropertyDto {
  id: number;
  propertyName: string;
}

interface TenantDto {
  id: number;
  fullName: string;
}

interface LeaseDto {
  id: number;
  tenantId: number;
  propertyId: number;
}

interface SummaryDto {
  year: number;
  month: number;
  totalRent: number;
  totalLevy: number;
  totalBond: number;
  totalExpenses: number;
  totalIncome: number;
  profit: number;
}

const HomeDashboard: React.FC = () => {
  const { token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [summary, setSummary] = useState<SummaryDto | null>(null);

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const downloadFinanceExcel = async () => {
    try {
      const response = await fetch(
        'http://localhost:5153/api/pay/export/finance', 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Excel export error:', errorText);
        
        // Try to parse JSON error for better messaging
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorJson.details || `Export failed: ${response.status}`);
        } catch {
          throw new Error(`Export failed: ${response.status} ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'property_finance.xlsx';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download Excel report. Please try again.');
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [p, t, l, s] = await Promise.all([
          fetch('http://localhost:5153/api/property', { headers }),
          fetch('http://localhost:5153/api/tenant', { headers }),
          fetch('http://localhost:5153/api/lease', { headers }),
          fetch(`http://localhost:5153/api/pay/summary?year=${year}&month=${month}`, { headers }),
        ]);

        // Handle 401 errors
        if ([p, t, l, s].some(r => r.status === 401)) {
          logout();
          return;
        }

        // Handle responses
        setProperties(p.ok ? await p.json() : []);
        setTenants(t.ok ? await t.json() : []);
        setLeases(l.ok ? await l.json() : []);
        setSummary(s.ok ? await s.json() : null);

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoadingProperties(false);
        setLoadingTenants(false);
        setLoadingLeases(false);
        setLoadingSummary(false);
      }
    };

    fetchData();
  }, [token, authLoading, navigate, logout]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);

  const getMonthName = (m: number) =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] || 'Unknown';

  if (authLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
      <Navigation />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Dashboard</h4>
        {summary && (
          <span className="badge bg-secondary">
            {getMonthName(summary.month)} {summary.year}
          </span>
        )}
      </div>

      {/* STATS */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div className="card bg-primary text-white shadow-sm h-100">
            <div className="card-body">
              <small>Properties</small>
              <h3 className="mb-0">{loadingProperties ? '...' : properties.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card bg-success text-white shadow-sm h-100">
            <div className="card-body">
              <small>Tenants</small>
              <h3 className="mb-0">{loadingTenants ? '...' : tenants.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card bg-info text-white shadow-sm h-100">
            <div className="card-body">
              <small>Leases</small>
              <h3 className="mb-0">{loadingLeases ? '...' : leases.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className={`card shadow-sm text-white h-100 ${summary?.profit! >= 0 ? 'bg-success' : 'bg-danger'}`}>
            <div className="card-body">
              <small>Profit</small>
              <h5 className="mb-0">{loadingSummary ? '...' : formatCurrency(summary?.profit || 0)}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Properties ({properties.length})</h6>
              <Link to="/add-property" className="btn btn-sm btn-primary">
                + Add
              </Link>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {loadingProperties ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-3 text-muted">No properties found</div>
              ) : (
                properties.map(p => (
                  <Link key={p.id} to={`/properties/${p.id}`} className="list-group-item list-group-item-action">
                    {p.propertyName}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Financial Summary</h6>
              <button
                onClick={downloadFinanceExcel}
                className="btn btn-sm btn-outline-success"
                disabled={loadingSummary}
              >
                {loadingSummary ? 'Loading...' : 'Export Excel'}
              </button>
            </div>
            <div className="card-body">
              {loadingSummary ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : summary ? (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Income</span>
                    <strong className="text-success">{formatCurrency(summary.totalIncome)}</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Expenses</span>
                    <strong className="text-danger">
                      {formatCurrency(summary.totalBond + summary.totalLevy + summary.totalExpenses)}
                    </strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Net Profit</span>
                    <span className={summary.profit >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(summary.profit)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-3">No financial data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-3 p-3 bg-light rounded d-flex gap-2 justify-content-center flex-wrap">
        <Link to="/add-rent-payment" className="btn btn-outline-primary btn-sm">
          📝 Record Payment
        </Link>
        <Link to="/add-expense" className="btn btn-outline-primary btn-sm">
          💰 Add Expense
        </Link>
        <Link to="/add-lease" className="btn btn-outline-primary btn-sm">
          📄 Create Lease
        </Link>
        <button
          onClick={downloadFinanceExcel}
          className="btn btn-outline-success btn-sm"
          disabled={loadingSummary}
        >
          📊 Export Finance (Excel)
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3 alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;