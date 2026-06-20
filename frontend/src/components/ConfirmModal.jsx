export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel = "Cancel", variant = "alert", onConfirm, onCancel, busy }) {
  if (!open) return null;

  const confirmClasses = {
    alert: "bg-alert-500 hover:bg-alert-600",
    safe: "bg-safe-500 hover:bg-safe-600",
    ink: "bg-ink-900 hover:bg-ink-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-lg border border-ink-100 shadow-panel max-w-md w-full p-6 animate-modal-in">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === "alert" ? "bg-alert-50" : "bg-ink-50"}`}>
            {variant === "alert" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-alert-500">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-ink-500">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-bold text-ink-900 text-base">{title}</h3>
            <p className="text-sm text-ink-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-sm font-semibold text-ink-700 border border-ink-100 rounded-md hover:bg-ink-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors disabled:opacity-50 ${confirmClasses[variant] || confirmClasses.alert}`}
          >
            {busy ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
