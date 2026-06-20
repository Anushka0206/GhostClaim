import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import TrustMeter from "../components/TrustMeter";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import PrintCaseReport from "../components/PrintCaseReport";
import EmptyState from "../components/EmptyState";
import { CaseDetailSkeleton } from "../components/Skeleton";

const STATUS_LABELS = {
  CLEARED: "Cleared",
  FRAUD_CONFIRMED: "Fraud Confirmed",
  UNDER_REVIEW: "Under Review",
};

export default function CaseDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { officer } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmFraud, setConfirmFraud] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const [c, a] = await Promise.all([api.getCase(id), api.getAlertsForCase(id)]);
      setCaseData(c);
      setAlerts(a);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status) {
    setBusy(true);
    try {
      await api.updateCaseStatus(id, status, note || undefined);
      setNote("");
      await load();
      toast(`Case marked as ${STATUS_LABELS[status] || status}`, status === "FRAUD_CONFIRMED" ? "warning" : "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
      setConfirmFraud(false);
    }
  }

  async function handleAlertResponse(alertId, response) {
    setBusy(true);
    try {
      await api.respondToAlert(alertId, response);
      await load();
      toast(
        response === "ALIVE_CONFIRMED"
          ? "Guardian confirmed alive — investigation on hold"
          : "No response recorded — investigation continues",
        response === "ALIVE_CONFIRMED" ? "success" : "warning"
      );
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !caseData) return <CaseDetailSkeleton />;

  const triggeredSignals = caseData.signals.filter((s) => s.triggered);
  const clearSignals = caseData.signals.filter((s) => !s.triggered);

  return (
    <>
      <div className="px-4 md:px-8 py-7 max-w-[1100px]">
        <Link to="/" className="text-xs font-semibold text-ink-300 hover:text-ink-700 mb-4 inline-flex items-center gap-1">
          ← Back to dashboard
        </Link>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-ink-900">{caseData.elderlyName}</h1>
            <div className="text-sm text-ink-500 mt-1">
              Aadhaar ···{caseData.aadhaarLast4} · {caseData.pensionScheme} · {caseData.state}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={caseData.status} />
              <button
                onClick={() => setShowPrint(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-ink-700 border border-ink-100 rounded-md hover:bg-ink-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Print Case Report
              </button>
            </div>
          </div>
          <TrustMeter score={caseData.riskScore} riskBand={caseData.riskBand} size={110} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          <div className="space-y-5">
            {/* Signal breakdown */}
            <section className="bg-white rounded-lg border border-ink-100 shadow-panel">
              <div className="px-4 md:px-5 py-4 border-b border-ink-100">
                <h2 className="font-bold text-ink-900 text-sm">Why this score (explainable AI signals)</h2>
              </div>
              <div className="px-4 md:px-5 py-4 space-y-2.5">
                {triggeredSignals.map((s) => (
                  <SignalRow key={s.key} signal={s} active />
                ))}
                {clearSignals.map((s) => (
                  <SignalRow key={s.key} signal={s} active={false} />
                ))}
              </div>
            </section>

            {/* Certificate details */}
            <section className="bg-white rounded-lg border border-ink-100 shadow-panel">
              <div className="px-4 md:px-5 py-4 border-b border-ink-100">
                <h2 className="font-bold text-ink-900 text-sm">Certificate &amp; Claim Record</h2>
              </div>
              <div className="px-4 md:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field label="Residence district" value={caseData.residenceDistrict} />
                <Field label="Registration district" value={caseData.registrationDistrict} />
                <Field label="Declared age at death" value={caseData.declaredAge} />
                <Field label="Aadhaar-linked age" value={caseData.aadhaarLinkedAge ?? "—"} />
                <Field label="Certificate issued" value={caseData.certificateIssueDate} />
                <Field label="Claim filed" value={caseData.claimFiledDate || "—"} />
                <Field label="Next pension due" value={caseData.nextPensionDueDate || "—"} />
                <Field label="Hospital record found" value={caseData.hospitalRecordFound ? "Yes" : "No"} />
              </div>
            </section>

            {/* Investigation notes */}
            <section className="bg-white rounded-lg border border-ink-100 shadow-panel">
              <div className="px-4 md:px-5 py-4 border-b border-ink-100">
                <h2 className="font-bold text-ink-900 text-sm">Investigation Actions</h2>
              </div>
              <div className="px-4 md:px-5 py-4 space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an investigation note (optional)…"
                  className="w-full text-sm border border-ink-100 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  rows={2}
                />
                <div className="flex gap-2 flex-wrap">
                  <ActionButton onClick={() => handleStatusChange("CLEARED")} disabled={busy} variant="safe">
                    Mark Cleared
                  </ActionButton>
                  <ActionButton onClick={() => setConfirmFraud(true)} disabled={busy} variant="alert">
                    Confirm Fraud
                  </ActionButton>
                  <ActionButton onClick={() => handleStatusChange("UNDER_REVIEW")} disabled={busy} variant="amber">
                    Keep Under Review
                  </ActionButton>
                </div>

                {caseData.investigationNotes.length > 0 && (
                  <div className="pt-2 border-t border-ink-100 space-y-2">
                    {caseData.investigationNotes.map((n, i) => (
                      <div key={i} className="text-xs text-ink-500">
                        <span className="text-ink-300">{new Date(n.at).toLocaleString()}</span> — {n.note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Guardian alerts sidebar */}
          <section className="bg-white rounded-lg border border-ink-100 shadow-panel h-fit">
            <div className="px-4 md:px-5 py-4 border-b border-ink-100">
              <h2 className="font-bold text-ink-900 text-sm">Guardian Alert</h2>
              <p className="text-xs text-ink-300 mt-0.5">Simulated multilingual IVR / SMS</p>
            </div>
            <div className="px-4 md:px-5 py-4 space-y-4">
              {alerts.length === 0 ? (
                <EmptyState
                  icon="alerts"
                  title="No alert triggered"
                  description="Risk band did not reach HIGH — no guardian IVR/SMS was sent for this case."
                />
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="border border-ink-100 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-ink-700 uppercase">{a.languageCode}</span>
                      <span className="text-[10px] text-ink-300">{a.phoneNumberMasked}</span>
                    </div>
                    <p className="text-sm text-ink-700 leading-relaxed bg-ink-50 rounded p-2.5 mb-3">{a.messageText}</p>

                    {a.status === "SENT" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <ActionButton small onClick={() => handleAlertResponse(a.id, "ALIVE_CONFIRMED")} disabled={busy} variant="safe">
                          Press 1 — I'm Alive
                        </ActionButton>
                        <ActionButton small onClick={() => handleAlertResponse(a.id, "NO_RESPONSE")} disabled={busy} variant="ink">
                          Simulate No Response
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <span className="font-semibold text-ink-700">Response: </span>
                        <span className={a.response === "ALIVE_CONFIRMED" ? "text-safe-600" : "text-alert-500"}>
                          {a.response === "ALIVE_CONFIRMED" ? "Confirmed alive" : "No response received"}
                        </span>
                        <div className="text-ink-300 mt-0.5">{new Date(a.respondedAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmFraud}
        title="Confirm Fraud?"
        message="This will permanently mark the case as fraud confirmed and log the decision to the tamper-proof audit trail. This action should only be taken after thorough investigation."
        confirmLabel="Yes, Confirm Fraud"
        variant="alert"
        busy={busy}
        onConfirm={() => handleStatusChange("FRAUD_CONFIRMED")}
        onCancel={() => setConfirmFraud(false)}
      />

      {showPrint && (
        <PrintCaseReport
          caseData={caseData}
          alerts={alerts}
          officerName={officer?.name}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
}

function SignalRow({ signal, active }) {
  return (
    <div className={`flex items-start gap-2.5 text-sm ${active ? "" : "opacity-40"}`}>
      <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-alert-500" : "bg-ink-100"}`}>
        {active && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <span className={active ? "text-ink-900" : "text-ink-300"}>{signal.label}</span>
      </div>
      <span className="text-xs text-ink-300 tabular-nums shrink-0">+{signal.weight}</span>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">{label}</div>
      <div className="text-ink-900 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function ActionButton({ children, onClick, disabled, variant = "ink", small }) {
  const variants = {
    ink: "bg-ink-900 text-white hover:bg-ink-700",
    safe: "bg-safe-500 text-white hover:bg-safe-600",
    alert: "bg-alert-500 text-white hover:bg-alert-600",
    amber: "bg-amber-500 text-white hover:bg-amber-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${small ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"} font-semibold rounded-md transition-colors disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
