// src/Pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Navigation from '../Nav';
import api from '../API/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

interface PropertyDto { id: number; propertyName: string; }
interface TenantDto { id: number; fullName: string; }
interface LeaseDto { id: number; tenantId: number; propertyId: number; }
interface SummaryDto { year: number; month: number; totalRent: number; totalLevy: number; totalBond: number; totalExpenses: number; totalIncome: number; profit: number; }
interface PropertyProfitSummary { propertyName: string; totalProfit: number; averageProfit: number; reportCount: number; }
interface MonthlyTrendPoint { period: string; properties: { propertyName: string; profit: number }[]; }
interface PropertyAnalyticsDto { profitByProperty: PropertyProfitSummary[]; monthlyTrend: MonthlyTrendPoint[]; underperformingProperties: string[]; }

const PROPERTY_COLORS = ['#0d6efd','#198754','#dc3545','#fd7e14','#6f42c1','#0dcaf0','#ffc107'];

const HomeDashboard: React.FC = () => {
  const { token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [summary, setSummary] = useState<SummaryDto | null>(null);
  const [analytics, setAnalytics] = useState<PropertyAnalyticsDto | null>(null);

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadFinanceExcel = async () => {
    try {
      const res = await api.get('/api/pay/export/finance', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'property_finance.xlsx';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download Excel report.');
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) { navigate('/login'); return; }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    Promise.all([
      api.get('/api/property'),
      api.get('/api/tenant'),
      api.get('/api/lease'),
      api.get(`/api/pay/summary?year=${year}&month=${month}`),
    ]).then(([p, t, l, s]) => {
      setProperties(p.data);
      setTenants(t.data);
      setLeases(l.data);
      setSummary(s.data);
    }).catch(() => {
      setError('Failed to load dashboard data. Please refresh.');
    }).finally(() => {
      setLoadingProperties(false); setLoadingTenants(false);
      setLoadingLeases(false); setLoadingSummary(false);
    });

    api.get('/api/reports/analytics')
      .then(r => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setLoadingAnalytics(false));

  }, [token, authLoading, navigate, logout]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(amount);

  const getMonthName = (m: number) =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] || 'Unknown';

  const trendData = analytics?.monthlyTrend.map(point => {
    const row: Record<string, string | number> = { period: point.period };
    point.properties.forEach(p => { row[p.propertyName] = p.profit; });
    return row;
  }) ?? [];

  const allPropertyNames = Array.from(
    new Set(analytics?.monthlyTrend.flatMap(p => p.properties.map(x => x.propertyName)) ?? [])
  );

  if (authLoading) return (
    <div className="container-fluid py-5 text-center">
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  );

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Dashboard</h4>
        {summary && <span className="badge bg-secondary">{getMonthName(summary.month)} {summary.year}</span>}
      </div>

      {/* STATS */}
      <div className="row g-3 mb-3">
        {[
          { label: 'Properties', value: loadingProperties ? '...' : properties.length, color: 'bg-primary' },
          { label: 'Tenants', value: loadingTenants ? '...' : tenants.length, color: 'bg-success' },
          { label: 'Leases', value: loadingLeases ? '...' : leases.length, color: 'bg-info' },
        ].map(({ label, value, color }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className={`card ${color} text-white shadow-sm h-100`}>
              <div className="card-body"><small>{label}</small><h3 className="mb-0">{value}</h3></div>
            </div>
          </div>
        ))}
        <div className="col-6 col-md-3">
          <div className={`card shadow-sm text-white h-100 ${(summary?.profit ?? 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
            <div className="card-body"><small>Profit</small><h5 className="mb-0">{loadingSummary ? '...' : formatCurrency(summary?.profit || 0)}</h5></div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Properties ({properties.length})</h6>
              <Link to="/add-property" className="btn btn-sm btn-primary">+ Add</Link>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {loadingProperties ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
                : properties.length === 0 ? <div className="text-center py-3 text-muted">No properties found</div>
                : properties.map(p => <Link key={p.id} to={`/properties/${encodeURIComponent(p.propertyName)}`} className="list-group-item list-group-item-action">
  {p.propertyName}
</Link>)}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Financial Summary</h6>
              <button onClick={downloadFinanceExcel} className="btn btn-sm btn-outline-success" disabled={loadingSummary}>
                {loadingSummary ? 'Loading...' : 'Export Excel'}
              </button>
            </div>
            <div className="card-body">
              {loadingSummary ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
                : summary ? (
                  <>
                    <div className="d-flex justify-content-between mb-2"><span>Income</span><strong className="text-success">{formatCurrency(summary.totalIncome)}</strong></div>
                    <hr />
                    <div className="d-flex justify-content-between mb-2"><span>Expenses</span><strong className="text-danger">{formatCurrency(summary.totalBond + summary.totalLevy + summary.totalExpenses)}</strong></div>
                    <hr />
                    <div className="d-flex justify-content-between fs-5 fw-bold">
                      <span>Net Profit</span>
                      <span className={summary.profit >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(summary.profit)}</span>
                    </div>
                  </>
                ) : <div className="text-center text-muted py-3">No financial data available</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <h5 className="mt-2 mb-3">📊 Property Performance</h5>
      {!loadingAnalytics && analytics && analytics.underperformingProperties.length > 0 && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <span className="me-2" style={{ fontSize: 20 }}>⚠️</span>
          <div><strong>Underperforming:</strong> {analytics.underperformingProperties.join(', ')} — average profit is negative.</div>
        </div>
      )}
      {!loadingAnalytics && analytics && analytics.profitByProperty.length === 0 && (
        <div className="alert alert-info mb-3">No report data yet. Generate reports on the <Link to="/reports">Reports page</Link> to see analytics.</div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><h6 className="mb-0">Total Profit by Property</h6><small className="text-muted">Across all saved reports</small></div>
            <div className="card-body">
              {loadingAnalytics ? <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /></div>
                : analytics && analytics.profitByProperty.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics.profitByProperty} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="propertyName" angle={-35} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total Profit']} />
                      <Bar dataKey="totalProfit" name="Total Profit" radius={[4,4,0,0]} fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="text-center text-muted py-5">No data yet</div>}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><h6 className="mb-0">Profit Trend Over Time</h6><small className="text-muted">Monthly profit per property</small></div>
            <div className="card-body">
              {loadingAnalytics ? <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /></div>
                : trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" angle={-35} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                      <Legend verticalAlign="top" />
                      {allPropertyNames.map((name, i) => (
                        <Line key={name} type="monotone" dataKey={name} stroke={PROPERTY_COLORS[i % PROPERTY_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="text-center text-muted py-5">No data yet</div>}
            </div>
          </div>
        </div>
      </div>

      {!loadingAnalytics && analytics && analytics.profitByProperty.length > 0 && (
        <div className="card shadow-sm mb-3">
          <div className="card-header"><h6 className="mb-0">Property Performance Summary</h6></div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light"><tr><th>Property</th><th>Reports</th><th>Avg Profit</th><th>Total Profit</th><th>Status</th></tr></thead>
              <tbody>
                {analytics.profitByProperty.slice().sort((a,b) => b.totalProfit - a.totalProfit).map(p => (
                  <tr key={p.propertyName}>
                    <td className="fw-semibold">{p.propertyName}</td>
                    <td>{p.reportCount}</td>
                    <td className={p.averageProfit >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(p.averageProfit)}</td>
                    <td className={p.totalProfit >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(p.totalProfit)}</td>
                    <td>
                      {p.averageProfit < 0 ? <span className="badge bg-danger">⚠️ Underperforming</span>
                        : p.averageProfit < 1000 ? <span className="badge bg-warning text-dark">Low margin</span>
                        : <span className="badge bg-success">✓ Healthy</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="mt-3 p-3 bg-light rounded d-flex gap-2 justify-content-center flex-wrap">
        <Link to="/add-rent-payment" className="btn btn-outline-primary btn-sm">📝 Record Payment</Link>
        <Link to="/add-expense" className="btn btn-outline-primary btn-sm">💰 Add Expense</Link>
        <Link to="/add-lease" className="btn btn-outline-primary btn-sm">📄 Create Lease</Link>
        <Link to="/reports" className="btn btn-outline-secondary btn-sm">📋 Reports</Link>
        <button onClick={downloadFinanceExcel} className="btn btn-outline-success btn-sm" disabled={loadingSummary}>📊 Export Finance (Excel)</button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3 alert-dismissible fade show">
          {error}<button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;