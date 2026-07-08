// src/Pages/PropertyDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../Nav';
import api from '../API/axios';

interface TenantPaymentStatus {
  tenantName: string;
  leaseId: number;
  expectedRent: number;
  expectedLevy: number;
  expectedBond: number;
  expectedRates: number;
  paidRent: boolean;
  paidLevy: boolean;
  paidBond: boolean;
  paidRates: boolean;
  rentAmount: number;
  levyAmount: number;
  bondAmount: number;
  ratesAmount: number;
}

interface MonthPaymentSummary {
  year: number;
  month: number;
  period: string;
  tenants: TenantPaymentStatus[];
}

interface PropertyPaymentStatusDto {
  propertyName: string;
  months: MonthPaymentSummary[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(n);

const StatusBadge: React.FC<{ paid: boolean; amount: number; expected: number }> = ({ paid, amount, expected }) => {
  if (paid) return (
    <span className="badge bg-success">
      ✓ {fmt(amount)}
    </span>
  );
  if (expected > 0) return (
    <span className="badge bg-danger">
      ✗ Unpaid
    </span>
  );
  return <span className="badge bg-secondary">N/A</span>;
};

const PropertyDetail: React.FC = () => {
  const { propertyName } = useParams<{ propertyName: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PropertyPaymentStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!propertyName) return;
    api.get(`/api/pay/property-status/${encodeURIComponent(propertyName)}`)
      .then(res => {
        setData(res.data);
        // Auto-expand the most recent month
        if (res.data.months.length > 0) {
          const first = res.data.months[0];
          setExpandedMonths(new Set([`${first.year}-${first.month}`]));
        }
      })
      .catch(err => {
        if (err?.response?.status === 404) {
          setError(`No active leases found for "${propertyName}".`);
        } else {
          setError('Failed to load payment data.');
        }
      })
      .finally(() => setLoading(false));
  }, [propertyName]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const getMonthSummary = (month: MonthPaymentSummary) => {
    const total = month.tenants.length;
    const allPaid = month.tenants.filter(t =>
      (t.expectedRent > 0 ? t.paidRent : true) &&
      (t.expectedLevy > 0 ? t.paidLevy : true) &&
      (t.expectedBond > 0 ? t.paidBond : true) &&
      (t.expectedRates > 0 ? t.paidRates : true)
    ).length;
    const totalCollected = month.tenants.reduce((sum, t) =>
      sum + t.rentAmount + t.levyAmount + t.bondAmount + t.ratesAmount, 0);
    return { total, allPaid, totalCollected };
  };

  if (loading) return (
    <div className="container-fluid py-3"><Navigation />
      <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
    </div>
  );

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1200px' }}>
      <Navigation />

      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/home')} className="btn btn-outline-secondary btn-sm">← Back</button>
        <div>
          <h4 className="mb-0">🏠 {propertyName}</h4>
          <small className="text-muted">Payment history by tenant</small>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error}
          <div className="mt-2">
            <small>Make sure there are active leases for this property and payments have been recorded.</small>
          </div>
        </div>
      )}

      {data && data.months.length === 0 && (
        <div className="alert alert-info">No payment records found for this property yet.</div>
      )}

      {data && data.months.map(month => {
        const key = `${month.year}-${month.month}`;
        const isExpanded = expandedMonths.has(key);
        const { total, allPaid, totalCollected } = getMonthSummary(month);
        const hasUnpaid = allPaid < total;

        return (
          <div key={key} className="card shadow-sm mb-3">
            {/* Month header — clickable to expand/collapse */}
            <div
              className={`card-header d-flex justify-content-between align-items-center ${hasUnpaid ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleMonth(key)}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="fw-semibold">{month.period}</span>
                {hasUnpaid
                  ? <span className="badge bg-danger">{total - allPaid} unpaid</span>
                  : <span className="badge bg-success">All paid</span>}
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small">Total collected: <strong>{fmt(totalCollected)}</strong></span>
                <span>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Tenant payment breakdown */}
            {isExpanded && (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Tenant</th>
                      <th className="text-center">Rent</th>
                      <th className="text-center">Levy</th>
                      <th className="text-center">Bond</th>
                      <th className="text-center">Rates</th>
                      <th className="text-end">Total Paid</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {month.tenants.map(tenant => {
                      const totalPaid = tenant.rentAmount + tenant.levyAmount + tenant.bondAmount + tenant.ratesAmount;
                      const totalExpected = tenant.expectedRent + tenant.expectedLevy + tenant.expectedBond + tenant.expectedRates;
                      const fullyPaid =
                        (tenant.expectedRent > 0 ? tenant.paidRent : true) &&
                        (tenant.expectedLevy > 0 ? tenant.paidLevy : true) &&
                        (tenant.expectedBond > 0 ? tenant.paidBond : true) &&
                        (tenant.expectedRates > 0 ? tenant.paidRates : true);

                      return (
                        <tr key={tenant.leaseId} className={!fullyPaid ? 'table-danger' : ''}>
                          <td className="align-middle fw-semibold">{tenant.tenantName}</td>
                          <td className="text-center align-middle">
                            <StatusBadge paid={tenant.paidRent} amount={tenant.rentAmount} expected={tenant.expectedRent} />
                          </td>
                          <td className="text-center align-middle">
                            <StatusBadge paid={tenant.paidLevy} amount={tenant.levyAmount} expected={tenant.expectedLevy} />
                          </td>
                          <td className="text-center align-middle">
                            <StatusBadge paid={tenant.paidBond} amount={tenant.bondAmount} expected={tenant.expectedBond} />
                          </td>
                          <td className="text-center align-middle">
                            <StatusBadge paid={tenant.paidRates} amount={tenant.ratesAmount} expected={tenant.expectedRates} />
                          </td>
                          <td className="text-end align-middle">
                            <strong className={totalPaid >= totalExpected ? 'text-success' : 'text-danger'}>
                              {fmt(totalPaid)}
                            </strong>
                            <div className="text-muted" style={{ fontSize: 11 }}>of {fmt(totalExpected)}</div>
                          </td>
                          <td className="text-center align-middle">
                            {fullyPaid
                              ? <span className="badge bg-success">✓ Complete</span>
                              : <span className="badge bg-danger">⚠ Incomplete</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PropertyDetail;