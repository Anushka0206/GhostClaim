// src/components/StatusBadge.jsx
const STATUS_CONFIG = {
  FLAGGED_UNDER_INVESTIGATION: { label: "Flagged · Under Investigation", className: "bg-alert-50 text-alert-500" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-amber-50 text-amber-600" },
  CLEARED: { label: "Cleared", className: "bg-safe-50 text-safe-600" },
  INVESTIGATION_HOLD_ALIVE_CONFIRMED: { label: "Hold · Alive Confirmed", className: "bg-ink-100 text-ink-700" },
  FRAUD_CONFIRMED: { label: "Fraud Confirmed", className: "bg-alert-500 text-white" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-ink-100 text-ink-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
