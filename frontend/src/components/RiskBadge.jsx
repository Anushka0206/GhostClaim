// src/components/RiskBadge.jsx
const STYLES = {
  HIGH: "bg-alert-50 text-alert-500 border-alert-500/20",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-500/20",
  LOW: "bg-safe-50 text-safe-600 border-safe-500/20",
};

export default function RiskBadge({ band }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${STYLES[band] || STYLES.LOW}`}>
      {band}
    </span>
  );
}
