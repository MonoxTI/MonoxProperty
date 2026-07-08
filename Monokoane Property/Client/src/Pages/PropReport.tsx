// src/Pages/PropReport.tsx
import React, { useState, useEffect } from "react";
import api from "../API/axios";
import Navigation from '../Nav';

interface Property { propertyName: string; }

interface ReportHistory {
  id: number; propertyName: string; month: number; year: number;
  rent: number; levy: number; bond: number; rates: number;
  expenses: number; profit: number; createdAt: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);
const fmt = (n: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);

export default function PropReport() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<ReportHistory[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportProperty, setExportProperty] = useState("");

  const [form, setForm] = useState({
    propertyName: "", month: new Date().getMonth() + 1, year: currentYear,
    rent: "", levy: "", bond: "", rates: "", expenses: "",
  });

  const rent = parseFloat(form.rent) || 0;
  const levy = parseFloat(form.levy) || 0;
  const bond = parseFloat(form.bond) || 0;
  const rates = parseFloat(form.rates) || 0;
  const expenses = parseFloat(form.expenses) || 0;
  const profit = rent - (levy + bond + rates + expenses);

  useEffect(() => {
    api.get("/api/property").then(res => setProperties(res.data)).catch(() => {});
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoadingReports(true);
    try { const res = await api.get("/api/reports"); setReports(res.data); }
    catch { } finally { setLoadingReports(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null); setSuccess(null);
  };

  const handleSave = async () => {
    if (!form.propertyName) { setError("Please select a property."); return; }
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      const res = await api.post("/api/reports/save", {
        propertyName: form.propertyName, month: Number(form.month), year: Number(form.year),
        rent, levy, bond, rates, expenses,
      });
      setSuccess(res.data.message || "Report saved successfully.");
      fetchReports();
      setForm(prev => ({ ...prev, rent: "", levy: "", bond: "", rates: "", expenses: "" }));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save report.");
    } finally { setSubmitting(false); }
  };

  const handleExport = async () => {
    if (!exportProperty) { setError("Please select a property to export."); return; }
    setExporting(true); setError(null); setSuccess(null);
    try {
      const res = await api.get(`/api/reports/export/${encodeURIComponent(exportProperty)}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${exportProperty}_AllReports.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(`Excel report for ${exportProperty} downloaded successfully.`);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(`No saved reports found for "${exportProperty}". Save some reports first.`);
      } else {
        setError("Failed to generate Excel report.");
      }
    } finally { setExporting(false); }
  };

  const handleRedownload = async (report: ReportHistory) => {
    try {
      const res = await api.get(`/api/reports/${report.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.propertyName}_${MONTHS[report.month - 1]}_${report.year}.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert("Failed to download report."); }
  };

  return (
    <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
      <Navigation />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Property Reports</h4>
      </div>

      {error && <div className="alert alert-danger alert-dismissible fade show mb-3">{error}<button type="button" className="btn-close" onClick={() => setError(null)} /></div>}
      {success && <div className="alert alert-success alert-dismissible fade show mb-3">{success}<button type="button" className="btn-close" onClick={() => setSuccess(null)} /></div>}

      <div className="row g-3 mb-4">
        {/* Save report card */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h6 className="mb-0">💾 Save Monthly Report</h6>
              <small className="text-muted">Record figures for a property and month</small>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted text-uppercase fw-semibold">Property</label>
                  <select name="propertyName" value={form.propertyName} onChange={handleChange} className="form-select">
                    <option value="">Select property</option>
                    {properties.map(p => <option key={p.propertyName} value={p.propertyName}>{p.propertyName}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small text-muted text-uppercase fw-semibold">Month</label>
                  <select name="month" value={form.month} onChange={handleChange} className="form-select">
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small text-muted text-uppercase fw-semibold">Year</label>
                  <select name="year" value={form.year} onChange={handleChange} className="form-select">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="row g-3 mb-3">
                {[{ name: "rent", label: "Rent (R)" }, { name: "levy", label: "Levy (R)" },
                  { name: "bond", label: "Bond (R)" }, { name: "rates", label: "Rates (R)" },
                  { name: "expenses", label: "Expenses (R)" }].map(({ name, label }) => (
                  <div className="col-6 col-md" key={name}>
                    <label className="form-label small text-muted text-uppercase fw-semibold">{label}</label>
                    <input type="number" name={name} value={(form as any)[name]} onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01" className="form-control" />
                  </div>
                ))}
              </div>
              <div className={`alert mb-3 ${profit >= 0 ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Projected Profit</span>
                  <span className={`fw-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(profit)}</span>
                </div>
              </div>
              <button type="button" onClick={handleSave} disabled={submitting} className="btn btn-primary w-100">
                {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : '💾 Save Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Export Excel card */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h6 className="mb-0">📥 Export to Excel</h6>
              <small className="text-muted">Downloads all saved months for a property</small>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="text-muted small mb-3">
                Select a property and click export. The Excel file will contain one row per saved month
                with all figures pulled automatically from your saved reports.
              </p>
              <div className="mb-3">
                <label className="form-label small text-muted text-uppercase fw-semibold">Property</label>
                <select value={exportProperty} onChange={e => { setExportProperty(e.target.value); setError(null); }} className="form-select">
                  <option value="">Select property</option>
                  {properties.map(p => <option key={p.propertyName} value={p.propertyName}>{p.propertyName}</option>)}
                </select>
              </div>
              {exportProperty && (
                <div className="alert alert-info py-2 mb-3">
                  <small>
                    <strong>{reports.filter(r => r.propertyName === exportProperty).length}</strong> saved
                    {reports.filter(r => r.propertyName === exportProperty).length === 1 ? ' report' : ' reports'} found
                    for <strong>{exportProperty}</strong>
                  </small>
                </div>
              )}
              <button type="button" onClick={handleExport} disabled={exporting || !exportProperty} className="btn btn-success w-100 mt-auto">
                {exporting ? <><span className="spinner-border spinner-border-sm me-2" />Generating...</> : '📥 Download Excel Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Past reports table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Saved Reports ({reports.length})</h6>
          <button onClick={fetchReports} className="btn btn-sm btn-outline-secondary" disabled={loadingReports}>
            {loadingReports ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
        <div className="table-responsive">
          {loadingReports ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4 text-muted">No reports yet. Save your first report above.</div>
          ) : (
            <table className="table table-hover table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th>Property</th><th>Period</th>
                  <th className="text-end">Rent</th><th className="text-end">Levy</th>
                  <th className="text-end">Bond</th><th className="text-end">Rates</th>
                  <th className="text-end">Expenses</th><th className="text-end">Profit</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td className="align-middle">{r.propertyName}</td>
                    <td className="align-middle"><span className="badge bg-light text-dark">{MONTHS[r.month - 1]} {r.year}</span></td>
                    <td className="text-end align-middle">{fmt(r.rent)}</td>
                    <td className="text-end align-middle">{fmt(r.levy)}</td>
                    <td className="text-end align-middle">{fmt(r.bond)}</td>
                    <td className="text-end align-middle">{fmt(r.rates)}</td>
                    <td className="text-end align-middle">{fmt(r.expenses)}</td>
                    <td className={`text-end align-middle fw-bold ${r.profit >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(r.profit)}</td>
                    <td className="text-end align-middle">
                      <button onClick={() => handleRedownload(r)} className="btn btn-sm btn-outline-success">↓ Single</button>
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