// src/Pages/Monthly.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from '../Nav.tsx';
import api from '../API/axios';

interface LeaseDto {
  id: number;
  propertyId: number;
  propertyName: string;
  tenantId: number;
  tenantName: string;
  rent: number;
  levy: number;
  bond: number;
  rates: number;
}

enum PaymentType { Rent = 0, Levy = 1, Bond = 2, Rates = 3, Other = 4 }

const RecordPayment: React.FC = () => {
  const [leaseId, setLeaseId] = useState<number | "">("");
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Rent);
  const [amount, setAmount] = useState("");
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leasesRes, propertiesRes, tenantsRes] = await Promise.all([
          api.get('/api/lease'),
          api.get('/api/property'),
          api.get('/api/tenant'),
        ]);
        const propertyMap = new Map(propertiesRes.data.map((p: any) => [p.id, p.propertyName]));
        const tenantMap = new Map(tenantsRes.data.map((t: any) => [t.id, t.fullName]));
        const enriched = leasesRes.data.map((lease: any) => ({
          ...lease,
          propertyName: propertyMap.get(lease.propertyId) || `Property #${lease.propertyId}`,
          tenantName: tenantMap.get(lease.tenantId) || `Tenant #${lease.tenantId}`,
        }));
        setLeases(enriched);
      } catch {
        setError("Failed to load leases. Please refresh.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (leaseId && leases.length > 0) {
      const selected = leases.find(l => l.id === leaseId);
      if (selected) {
        const amounts: Record<number, string> = {
          [PaymentType.Rent]: selected.rent.toString(),
          [PaymentType.Bond]: selected.bond.toString(),
          [PaymentType.Levy]: selected.levy.toString(),
          [PaymentType.Rates]: selected.rates.toString(),
        };
        setAmount(amounts[paymentType] ?? "");
      }
    }
  }, [leaseId, paymentType, leases]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (leaseId === "") return setError("Please select a lease");
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return setError("Amount must be a positive number");

    try {
      setLoading(true);
      await api.post('/api/pay/record', { LeaseId: leaseId, Type: paymentType, Amount: amountNum });
      setSuccess(true);
      setTimeout(() => navigate("/home"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.title || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
      <p className="mt-2">Loading active leases...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-5">
      <Navigation />
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">Record Payment</h2>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {success && <div className="alert alert-success" role="alert"><h5 className="mb-2">Payment Recorded Successfully!</h5><p className="mb-0">Redirecting...</p></div>}
              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Lease</label>
                    <select className="form-select w-100" value={leaseId}
                      onChange={(e) => setLeaseId(e.target.value ? Number(e.target.value) : "")} required>
                      <option value="">-- Select an active lease --</option>
                      {leases.map(l => <option key={l.id} value={l.id}>{l.tenantName} • {l.propertyName} (ID: {l.id})</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payment Type</label>
                    <select className="form-select w-100" value={paymentType}
                      onChange={(e) => setPaymentType(Number(e.target.value) as PaymentType)} required>
                      <option value={PaymentType.Rent}>Rent</option>
                      <option value={PaymentType.Levy}>Levy</option>
                      <option value={PaymentType.Bond}>Bond</option>
                      <option value={PaymentType.Rates}>Rates</option>
                      <option value={PaymentType.Other}>Other</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Amount (R)</label>
                    <input type="number" className="form-control w-100" value={amount}
                      onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required placeholder="e.g. 8500.00" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2" />Recording...</>) : 'Record Payment'}
                  </button>
                </form>
              )}
              {!success && <div className="mt-3 text-center"><a href="/home" className="text-decoration-none">← Back to Home</a></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPayment;