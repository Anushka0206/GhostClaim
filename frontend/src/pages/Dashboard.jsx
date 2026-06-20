import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import TrustMeter from "../components/TrustMeter";
import RiskBadge from "../components/RiskBadge";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { DashboardSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [c, s, d] = await Promise.all([api.getCases(), api.getSummary(), api.getDistrictStats()]);
      setCases(c);
      setSummary(s);
      setDistricts(d);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return <ConnectionError error={error} onRetry={loadAll} />;

  const searchLower = search.trim().toLowerCase();
  const filteredCases = cases.filter((c) => {
    const matchesBand = filter === "ALL" || c.riskBand === filter;
    const matchesSearch =
      !searchLower ||
      c.elderlyName.toLowerCase().includes(searchLower) ||
      c.aadhaarLast4.includes(search.trim());
    return matchesBand && matchesSearch;
  });

  return (
    <div className="px-4 md:px-8 py-7 max-w-[1280px]">
      <header className="mb-7">
        <h1 className="text-xl md:text-2xl font-extrabold text-ink-900">Pension Fraud Intelligence Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          Live screening of death certificates against pension and Aadhaar records, statewide.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-7">
        <StatCard label="Certificates Screened" value={summary.total} />
        <StatCard label="High Risk Flags" value={summary.high} accent="alert" sublabel="Guardian alert auto-sent" />
        <StatCard label="Under Review" value={summary.medium} accent="amber" />
        <StatCard
          label="Est. Value Protected"
          value={`₹${(summary.estimatedValueProtected / 100000).toFixed(1)}L`}
          accent="safe"
          sublabel="Based on flagged high-risk claims"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Case list */}
        <section className="bg-white rounded-lg border border-ink-100 shadow-panel overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-ink-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-ink-900 text-sm">Flagged Cases</h2>
              <div className="flex gap-1 flex-wrap">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((band) => (
                  <button
                    key={band}
                    onClick={() => setFilter(band)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      filter === band ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-50"
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            {/* Search box */}
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or Aadhaar last 4…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-ink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-ink-50/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-ink-100">
            {filteredCases.length === 0 && (
              <EmptyState
                icon={search ? "search" : "cases"}
                title={search ? "No matching cases" : "No cases match this filter"}
                description={
                  search
                    ? `No cases found for "${search}". Try a different name or Aadhaar digits.`
                    : "Try selecting a different risk band filter to see more cases."
                }
                action={
                  search ? (
                    <button
                      onClick={() => setSearch("")}
                      className="px-3 py-1.5 text-xs font-semibold text-ink-700 border border-ink-100 rounded-md hover:bg-ink-50"
                    >
                      Clear search
                    </button>
                  ) : null
                }
              />
            )}
            {filteredCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-ink-50/60 transition-colors"
              >
                <TrustMeter score={c.riskScore} riskBand={c.riskBand} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm truncate">{c.elderlyName}</div>
                  <div className="text-xs text-ink-300 mt-0.5 truncate">
                    {c.registrationDistrict} · {c.pensionScheme} · Aadhaar ···{c.aadhaarLast4}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <StatusBadge status={c.status} />
                  <RiskBadge band={c.riskBand} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* District hotspots */}
        <section className="bg-white rounded-lg border border-ink-100 shadow-panel overflow-hidden h-fit">
          <div className="px-4 md:px-5 py-4 border-b border-ink-100">
            <h2 className="font-bold text-ink-900 text-sm">District Fraud Hotspots</h2>
            <p className="text-xs text-ink-300 mt-0.5">Ranked by high-risk case count</p>
          </div>
          <div className="px-4 md:px-5 py-4 space-y-3">
            {districts.length === 0 ? (
              <EmptyState
                icon="cases"
                title="No district data yet"
                description="District statistics will appear once cases are registered."
              />
            ) : (
              districts.map((d) => (
                <div key={d.district}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-ink-700">{d.district}</span>
                    <span className="text-ink-300">{d.total} cases</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-50 overflow-hidden flex">
                    {d.high > 0 && (
                      <div
                        className="bg-alert-500 h-full"
                        style={{ width: `${(d.high / d.total) * 100}%` }}
                        title={`${d.high} high risk`}
                      />
                    )}
                    {d.medium > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(d.medium / d.total) * 100}%` }}
                        title={`${d.medium} medium risk`}
                      />
                    )}
                    {d.low > 0 && (
                      <div
                        className="bg-safe-500 h-full"
                        style={{ width: `${(d.low / d.total) * 100}%` }}
                        title={`${d.low} low risk`}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ConnectionError({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3 px-6 text-center">
      <div className="text-ink-900 font-bold">Can't reach the GhostClaim Shield API</div>
      <div className="text-sm text-ink-300 max-w-md">
        Make sure the backend is running on port 4000 (<code className="text-xs bg-ink-50 px-1.5 py-0.5 rounded">npm run dev</code> inside{" "}
        <code className="text-xs bg-ink-50 px-1.5 py-0.5 rounded">backend/</code>). Error: {error}
      </div>
      <button onClick={onRetry} className="mt-2 px-4 py-2 bg-ink-900 text-white text-sm font-semibold rounded-md">
        Retry
      </button>
    </div>
  );
}
