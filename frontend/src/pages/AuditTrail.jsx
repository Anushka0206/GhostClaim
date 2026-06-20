import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import { AuditTrailSkeleton } from "../components/Skeleton";

const EVENT_LABELS = {
  CERTIFICATE_SUBMITTED: { label: "Certificate Submitted", color: "bg-ink-700" },
  RISK_SCORED: { label: "AI Risk Scored", color: "bg-amber-500" },
  GUARDIAN_ALERT_SENT: { label: "Guardian Alert Sent", color: "bg-alert-500" },
  GUARDIAN_ALERT_RESPONSE: { label: "Alert Response Received", color: "bg-safe-500" },
  CASE_STATUS_UPDATED: { label: "Case Status Updated", color: "bg-ink-500" },
};

export default function AuditTrail() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [trail, check] = await Promise.all([api.getAuditTrail(), api.verifyAuditTrail()]);
      setEntries([...trail].reverse());
      setIntegrity(check);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReverify() {
    setVerifying(true);
    try {
      const check = await api.verifyAuditTrail();
      setIntegrity(check);
      toast(
        check.valid ? "Audit chain verified — no tampering detected" : `Chain integrity broken at entry #${check.brokenAtIndex}`,
        check.valid ? "success" : "error"
      );
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) return <AuditTrailSkeleton />;

  return (
    <div className="px-4 md:px-8 py-7 max-w-[920px]">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-ink-900">Tamper-Proof Audit Trail</h1>
        <p className="mt-1 text-sm text-ink-500">
          Every flag, alert, and resolution is chained by cryptographic hash — the same tamper-evidence guarantee a blockchain
          ledger provides, verifiable by recomputing the chain below.
        </p>
      </header>

      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border px-4 md:px-5 py-4 mb-6 ${
          integrity?.valid ? "bg-safe-50 border-safe-500/20" : "bg-alert-50 border-alert-500/20"
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${integrity?.valid ? "bg-safe-500" : "bg-alert-500"}`}>
          {integrity?.valid ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className={`font-bold text-sm ${integrity?.valid ? "text-safe-600" : "text-alert-500"}`}>
            {integrity?.valid ? "Chain verified — no tampering detected" : "Chain integrity broken"}
          </div>
          <div className="text-xs text-ink-500 mt-0.5">
            {integrity?.valid
              ? `${entries.length} entries recomputed and matched against their stored hashes.`
              : `Mismatch found at entry #${integrity.brokenAtIndex}: ${integrity.reason}`}
          </div>
        </div>
        <button
          onClick={handleReverify}
          disabled={verifying}
          className="sm:ml-auto px-3 py-1.5 bg-white border border-ink-100 text-xs font-semibold rounded-md text-ink-700 disabled:opacity-50 shrink-0"
        >
          {verifying ? "Verifying…" : "Re-verify"}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg border border-ink-100 shadow-panel">
          <EmptyState
            icon="audit"
            title="No audit entries yet"
            description="Actions like certificate submissions, risk scoring, and status updates will appear here as a tamper-proof hash chain."
          />
        </div>
      ) : (
        <div className="space-y-0">
          {entries.map((e, i) => {
            const config = EVENT_LABELS[e.eventType] || { label: e.eventType, color: "bg-ink-500" };
            return (
              <div key={e.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${config.color}`} />
                  {i < entries.length - 1 && <div className="w-px flex-1 bg-ink-100 my-1" />}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-bold text-sm text-ink-900">{config.label}</span>
                    <span className="text-xs text-ink-300">{new Date(e.timestamp).toLocaleString()}</span>
                  </div>
                  <pre className="mt-1.5 text-xs bg-ink-50 rounded-md p-2.5 overflow-x-auto font-mono text-ink-700">
{JSON.stringify(e.payload, null, 2)}
                  </pre>
                  <div className="mt-1.5 text-[10px] text-ink-300 font-mono truncate" title={e.hash}>
                    hash: {e.hash.slice(0, 24)}… ← prev: {e.previousHash === "GENESIS" ? "GENESIS" : e.previousHash.slice(0, 16) + "…"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
