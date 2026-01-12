// src/components/HomeDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.tsx';
import Navigation from '../Nav.tsx';

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
  
  // State for all data
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [summary, setSummary] = useState<SummaryDto | null>(null);
  
  // Loading states
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch all data in parallel
  useEffect(() => {
    // If auth system is still initializing, wait
    if (authLoading) return;

    // If no token, redirect to login
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        };

        console.log('Making API calls...');

        // Get current year and month for summary
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

        // Fetch all endpoints concurrently
        const [
          propertiesRes,
          tenantsRes,
          leasesRes,
          summaryRes
        ] = await Promise.all([
          fetch('http://localhost:5153/api/property', { headers }),
          fetch('http://localhost:5153/api/tenant', { headers }),
          fetch('http://localhost:5153/api/lease', { headers }),
          fetch(`http://localhost:5153/api/pay/summary?year=${currentYear}&month=${currentMonth}`, { 
            headers 
          })
        ]);

        // Check for 401 (Unauthorized)
        if (propertiesRes.status === 401 || tenantsRes.status === 401 || 
            leasesRes.status === 401 || summaryRes.status === 401) {
          console.error('Got 401 response - Unauthorized');
          setError('Authentication failed. Your session may have expired.');
          logout(); // 👈 Automatically logs out and redirects to /login
          return;
        }

        // Handle properties
        if (propertiesRes.ok) {
          const propertiesText = await propertiesRes.text();
          const propertiesData = propertiesText.trim() ? JSON.parse(propertiesText) : [];
          setProperties(Array.isArray(propertiesData) ? propertiesData : []);
          console.log('Properties loaded:', propertiesData.length);
        } else {
          console.error('Properties fetch failed:', propertiesRes.status, propertiesRes.statusText);
        }
        setLoadingProperties(false);

        // Handle tenants
        if (tenantsRes.ok) {
          const tenantsText = await tenantsRes.text();
          const tenantsData = tenantsText.trim() ? JSON.parse(tenantsText) : [];
          setTenants(Array.isArray(tenantsData) ? tenantsData : []);
          console.log('Tenants loaded:', tenantsData.length);
        } else {
          console.error('Tenants fetch failed:', tenantsRes.status, tenantsRes.statusText);
        }
        setLoadingTenants(false);

        // Handle leases
        if (leasesRes.ok) {
          const leasesText = await leasesRes.text();
          const leasesData = leasesText.trim() ? JSON.parse(leasesText) : [];
          setLeases(Array.isArray(leasesData) ? leasesData : []);
          console.log('Leases loaded:', leasesData.length);
        } else {
          console.error('Leases fetch failed:', leasesRes.status, leasesRes.statusText);
        }
        setLoadingLeases(false);

        // Handle summary report
        if (summaryRes.ok) {
          const summaryText = await summaryRes.text();
          if (summaryText.trim()) {
            const summaryData = JSON.parse(summaryText);
            setSummary(summaryData as SummaryDto);
            console.log('Summary loaded:', summaryData);
          }
        } else {
          console.error('Summary fetch failed:', summaryRes.status, summaryRes.statusText);
        }
        setLoadingSummary(false);

        // Check for any errors
        if (!propertiesRes.ok || !tenantsRes.ok || !leasesRes.ok || !summaryRes.ok) {
          setError('Some data failed to load. Please refresh the page.');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to connect to the server. Please check your connection.');
        setLoadingProperties(false);
        setLoadingTenants(false);
        setLoadingLeases(false);
        setLoadingSummary(false);
      }
    };

    fetchData();
  }, [token, authLoading, navigate, logout]); // 👈 Dependencies

  // Format currency as R1,234.50
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get current month name
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex - 1] || 'Unknown';
  };

  // Show loading while auth system initializes
  if (authLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <Navigation/>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Dashboard</h4>
        <span className="badge bg-secondary">
          {summary && `${getMonthName(summary.month)} ${summary.year}`}
        </span>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-3 mb-3">
        <div className="col-3">
          <div className="card border-0 shadow-sm bg-primary bg-gradient text-white">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="opacity-75 small">Properties</div>
                  <h3 className="mb-0 mt-1">{loadingProperties ? '...' : properties.length}</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="opacity-50" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L8.707 1.5Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="card border-0 shadow-sm bg-success bg-gradient text-white">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="opacity-75 small">Tenants</div>
                  <h3 className="mb-0 mt-1">{loadingTenants ? '...' : tenants.length}</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="opacity-50" viewBox="0 0 16 16">
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h9Zm-7.978-1A.271.271 0 0 1 7 12.996c.001-.266.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.274.272h-.008Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="card border-0 shadow-sm bg-info bg-gradient text-white">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="opacity-75 small">Leases</div>
                  <h3 className="mb-0 mt-1">{loadingLeases ? '...' : leases.length}</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="opacity-50" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className={`card border-0 shadow-sm ${summary?.profit >= 0 ? 'bg-success' : 'bg-danger'} bg-gradient text-white`}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="opacity-75 small">Monthly Profit</div>
                  <h5 className="mb-0 mt-1">
                    {loadingSummary ? '...' : formatCurrency(summary?.profit || 0)}
                  </h5>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="opacity-50" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-3">
        {/* Properties List */}
        <div className="col-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
              <h6 className="mb-0">Properties ({properties.length})</h6>
              <Link to="/add-property" className="btn btn-sm btn-primary">
                + Add
              </Link>
            </div>
            <div className="card-body p-0" style={{ height: '320px', overflowY: 'auto' }}>
              {loadingProperties ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No properties found
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {properties.map(property => (
                    <Link 
                      key={property.id}
                      to={`/properties/${property.id}`} 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                    >
                      <span>{property.propertyName}</span>
                      <span className="badge bg-light text-dark border">
                        #{property.id}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="col-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-2">
              <h6 className="mb-0">Financial Summary</h6>
            </div>
            <div className="card-body" style={{ height: '320px', overflowY: 'auto' }}>
              {loadingSummary ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : summary ? (
                <div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Income</span>
                      <span className="fw-bold text-success">{formatCurrency(summary.totalIncome)}</span>
                    </div>
                    <div className="ps-3">
                      <div className="d-flex justify-content-between text-muted small">
                        <span>Rent</span>
                        <span>{formatCurrency(summary.totalRent)}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted small">
                        <span>Levy</span>
                        <span>{formatCurrency(summary.totalLevy)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3 pt-2 border-top">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Expenses</span>
                      <span className="fw-bold text-danger">{formatCurrency(summary.totalBond + summary.totalLevy + summary.totalExpenses)}</span>
                    </div>
                    <div className="ps-3">
                      <div className="d-flex justify-content-between text-muted small">
                        <span>Bond</span>
                        <span>{formatCurrency(summary.totalBond)}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted small">
                        <span>Other</span>
                        <span>{formatCurrency(summary.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-5">Net Profit</span>
                      <span className={`fw-bold fs-5 ${summary.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(summary.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  No financial data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 p-3 bg-light rounded">
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/add-rent-payment" className="btn btn-outline-primary btn-sm">
            📝 Record Payment
          </Link>
          <Link to="/add-expense" className="btn btn-outline-primary btn-sm">
            💰 Add Expense
          </Link>
          <Link to="/add-lease" className="btn btn-outline-primary btn-sm">
            📄 Create Lease
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;