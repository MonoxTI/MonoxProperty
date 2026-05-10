// src/components/PropReport.tsx
import { useState, useEffect } from "react";
import api from "../API/axios";
import Navigation from '../Nav'; 

interface Property {
  propertyName: string;
}

interface ReportHistory {
  id: number;
  propertyName: string;
  month: number;
  year: number;
  rent: number;
  levy: number;
  bond: number;
  rates: number;
  expenses: number;
  profit: number;
  createdAt: string;
}

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { 
    style: "currency", 
    currency: "ZAR", 
    minimumFractionDigits: 2 
  }).format(n);

export default function PropReport() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<ReportHistory[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    propertyName: "",
    month: new Date().getMonth() + 1,
    year: currentYear,
    rent: "",
    levy: "",
    bond: "",
    rates: "",
    expenses: "",
  });

  const rent = parseFloat(form.rent) || 0;
  const levy = parseFloat(form.levy) || 0;
  const bond = parseFloat(form.bond) || 0;
  const rates = parseFloat(form.rates) || 0;
  const expenses = parseFloat(form.expenses) || 0;
  const profit = rent - (levy + bond + rates + expenses);

  useEffect(() => {
    api.get("/property").then((res) => setProperties(res.data)).catch(() => {});
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch {
      // silently fail — table just stays empty
    } finally {
      setLoadingReports(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyName) return setError("Please select a property.");
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        propertyName: form.propertyName,
        month: Number(form.month),
        year: Number(form.year),
        rent,
        levy,
        bond,
        rates,
        expenses,
      };

      const res = await api.post("/reports/save-export", payload, {
        responseType: "blob",
      });

      // Trigger file download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const monthName = MONTHS[Number(form.month) - 1];
      link.setAttribute("download", `${form.propertyName}_${monthName}_${form.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Report saved and downloaded successfully.");
      fetchReports();

      // Reset amounts only, keep property/month/year
      setForm((prev) => ({ ...prev, rent: "", levy: "", bond: "", rates: "", expenses: "" }));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to generate report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedownload = async (report: ReportHistory) => {
    try {
      const res = await api.get(`/reports/${report.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.propertyName}_${MONTHS[report.month - 1]}_${report.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download report.");
    }
  };

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
      <Navigation />  

      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Property Report</h4>
        <span className="badge bg-secondary">
          {MONTHS[form.month - 1]} {form.year}
        </span>
      </div>

      {/* Form card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">Generate Monthly Report</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            
            {/* Row 1: Property + Month + Year */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small text-muted text-uppercase fw-semibold">
                  Property
                </label>
                <select 
                  name="propertyName" 
                  value={form.propertyName} 
                  onChange={handleChange} 
                  className="form-select" 
                  required
                >
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.propertyName} value={p.propertyName}>
                      {p.propertyName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small text-muted text-uppercase fw-semibold">
                  Month
                </label>
                <select 
                  name="month" 
                  value={form.month} 
                  onChange={handleChange} 
                  className="form-select"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small text-muted text-uppercase fw-semibold">
                  Year
                </label>
                <select 
                  name="year" 
                  value={form.year} 
                  onChange={handleChange} 
                  className="form-select"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Amounts */}
            <div className="row g-3 mb-3">
              {[
                { name: "rent", label: "Rent (R)" },
                { name: "levy", label: "Levy (R)" },
                { name: "bond", label: "Bond (R)" },
                { name: "rates", label: "Rates (R)" },
                { name: "expenses", label: "Expenses (R)" },
              ].map(({ name, label }) => (
                <div className="col-6 col-md" key={name}>
                  <label className="form-label small text-muted text-uppercase fw-semibold">
                    {label}
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            {/* Profit preview */}
            <div className={`alert mb-3 ${profit >= 0 ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Projected Profit</span>
                <span className={`fw-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {fmt(profit)}
                </span>
              </div>
            </div>

            {/* Feedback alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                {success}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccess(null)}
                ></button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting} 
              className="btn btn-primary w-100"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generating...
                </>
              ) : "Generate & Download Report"}
            </button>
          </form>
        </div>
      </div>

      {/* Past reports */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Past Reports ({reports.length})</h6>
          <button 
            onClick={fetchReports} 
            className="btn btn-sm btn-outline-secondary"
            disabled={loadingReports}
          >
            {loadingReports ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
        <div className="table-responsive">
          {loadingReports ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No reports yet. Generate your first report above.
            </div>
          ) : (
            <table className="table table-hover table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th>Property</th>
                  <th>Period</th>
                  <th className="text-end">Rent</th>
                  <th className="text-end">Levy</th>
                  <th className="text-end">Bond</th>
                  <th className="text-end">Rates</th>
                  <th className="text-end">Expenses</th>
                  <th className="text-end">Profit</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="align-middle">{r.propertyName}</td>
                    <td className="align-middle">
                      <span className="badge bg-light text-dark">
                        {MONTHS[r.month - 1]} {r.year}
                      </span>
                    </td>
                    <td className="text-end align-middle">{fmt(r.rent)}</td>
                    <td className="text-end align-middle">{fmt(r.levy)}</td>
                    <td className="text-end align-middle">{fmt(r.bond)}</td>
                    <td className="text-end align-middle">{fmt(r.rates)}</td>
                    <td className="text-end align-middle">{fmt(r.expenses)}</td>
                    <td className={`text-end align-middle fw-bold ${r.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {fmt(r.profit)}
                    </td>
                    <td className="text-end align-middle">
                      <button
                        onClick={() => handleRedownload(r)}
                        className="btn btn-sm btn-outline-success"
                        title="Re-download"
                      >
                        ↓ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}