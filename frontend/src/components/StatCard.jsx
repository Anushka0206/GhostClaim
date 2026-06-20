// src/components/StatCard.jsx
export default function StatCard({ label, value, accent = "ink", sublabel }) {
  const accentClasses = {
    ink: "text-ink-900",
    alert: "text-alert-500",
    amber: "text-amber-600",
    safe: "text-safe-600",
  };

  return (
    <div className="bg-white rounded-lg border border-ink-100 shadow-panel px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">{label}</div>
      <div className={`mt-1.5 text-3xl font-extrabold tabular-nums ${accentClasses[accent]}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-ink-300">{sublabel}</div>}
    </div>
  );
}
