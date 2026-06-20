import { useEffect } from "react";
import StatusBadge from "./StatusBadge";
import RiskBadge from "./RiskBadge";

export default function PrintCaseReport({ caseData, alerts, officerName, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);

  const triggeredSignals = caseData.signals.filter((s) => s.triggered);
  const generatedAt = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });

  return (
    <>
      {/* Screen-only controls */}
      <div className="no-print fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-panel max-w-[800px] w-full my-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h2 className="font-bold text-ink-900">Print Preview — Case Report</h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-ink-900 text-white text-sm font-semibold rounded-md"
              >
                Print Report
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-ink-100 text-ink-700 text-sm font-semibold rounded-md"
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-8">
            <ReportContent
              caseData={caseData}
              alerts={alerts}
              officerName={officerName}
              triggeredSignals={triggeredSignals}
              generatedAt={generatedAt}
            />
          </div>
        </div>
      </div>

      {/* Print-only content */}
      <div className="hidden print:block p-8">
        <ReportContent
          caseData={caseData}
          alerts={alerts}
          officerName={officerName}
          triggeredSignals={triggeredSignals}
          generatedAt={generatedAt}
        />
      </div>
    </>
  );
}

function ReportContent({ caseData, alerts, officerName, triggeredSignals, generatedAt }) {
  return (
    <div className="text-ink-900 text-sm">
      <header className="border-b-2 border-ink-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-300">Government of India — Confidential</div>
            <h1 className="text-xl font-extrabold mt-1">GhostClaim Shield — Case Investigation Report</h1>
          </div>
          <div className="text-right text-xs text-ink-500">
            <div>Generated: {generatedAt}</div>
            <div>Officer: {officerName || "—"}</div>
            <div className="font-mono mt-1">Case ID: {caseData.id.slice(0, 8)}…</div>
          </div>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-3">Subject</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <Field label="Elderly Person" value={caseData.elderlyName} />
          <Field label="Aadhaar (last 4)" value={`···${caseData.aadhaarLast4}`} />
          <Field label="Pension Scheme" value={caseData.pensionScheme} />
          <Field label="State" value={caseData.state} />
          <Field label="Status">
            <StatusBadge status={caseData.status} />
          </Field>
          <Field label="Risk Assessment">
            <span className="font-bold">{caseData.riskScore}/100</span> — <RiskBadge band={caseData.riskBand} />
          </Field>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-3">Triggered Fraud Signals ({triggeredSignals.length})</h2>
        {triggeredSignals.length === 0 ? (
          <p className="text-ink-500 italic">No fraud signals triggered.</p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left py-1.5 font-semibold text-ink-300">Signal</th>
                <th className="text-right py-1.5 font-semibold text-ink-300 w-16">Weight</th>
              </tr>
            </thead>
            <tbody>
              {triggeredSignals.map((s) => (
                <tr key={s.key} className="border-b border-ink-50">
                  <td className="py-1.5">{s.label}</td>
                  <td className="py-1.5 text-right tabular-nums">+{s.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-3">Certificate &amp; Claim Record</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <Field label="Residence District" value={caseData.residenceDistrict} />
          <Field label="Registration District" value={caseData.registrationDistrict} />
          <Field label="Declared Age at Death" value={caseData.declaredAge} />
          <Field label="Aadhaar-Linked Age" value={caseData.aadhaarLinkedAge ?? "—"} />
          <Field label="Certificate Issued" value={caseData.certificateIssueDate} />
          <Field label="Claim Filed" value={caseData.claimFiledDate || "—"} />
          <Field label="Next Pension Due" value={caseData.nextPensionDueDate || "—"} />
          <Field label="Hospital Record Found" value={caseData.hospitalRecordFound ? "Yes" : "No"} />
        </div>
      </section>

      {alerts.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-3">Guardian Alert Log</h2>
          {alerts.map((a) => (
            <div key={a.id} className="mb-3 p-3 border border-ink-100 rounded text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-semibold uppercase">{a.languageCode}</span>
                <span className="text-ink-300">{a.phoneNumberMasked}</span>
              </div>
              <p className="text-ink-700 mb-1">{a.messageText}</p>
              <div>
                Status: {a.status === "SENT" ? "Awaiting response" : a.response === "ALIVE_CONFIRMED" ? "Confirmed alive" : "No response"}
                {a.respondedAt && ` — ${new Date(a.respondedAt).toLocaleString()}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {caseData.investigationNotes.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-3">Investigation Notes</h2>
          {caseData.investigationNotes.map((n, i) => (
            <div key={i} className="text-xs text-ink-700 mb-1">
              <span className="text-ink-300">{new Date(n.at).toLocaleString()}</span> — {n.note}
            </div>
          ))}
        </section>
      )}

      <footer className="border-t border-ink-100 pt-4 mt-8 text-[10px] text-ink-300">
        This report was generated by GhostClaim Shield. Risk scores are produced by an explainable multi-signal engine.
        This document is for official investigation purposes only.
      </footer>
    </div>
  );
}

function Field({ label, value, children }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-300">{label}</div>
      <div className="font-medium mt-0.5">{children || value}</div>
    </div>
  );
}
