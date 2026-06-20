const ICONS = {
  cases: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ink-300">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8M8 8h5M8 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  alerts: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ink-300">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  audit: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ink-300">
      <rect x="2" y="9" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="9" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  search: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ink-300">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function EmptyState({ icon = "cases", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-ink-50 flex items-center justify-center mb-4">
        {ICONS[icon] || ICONS.cases}
      </div>
      <h3 className="font-bold text-ink-900 text-sm mb-1">{title}</h3>
      {description && <p className="text-xs text-ink-300 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
