// src/services/caseService.js
//
// Orchestrates the end-to-end flow described in the proposal:
// Component A (risk scoring) -> Component B (verification flag) ->
// Component C (guardian alert, auto-triggered for HIGH risk) ->
// Component D (audit trail entry for every step).

import { insertRow, readTable, updateRow, findById } from "../db/jsonStore.js";
import { computeRiskScore } from "./riskEngine.js";
import { appendAuditEntry } from "./auditTrail.js";
import { sendGuardianAlert } from "./alertService.js";
import { v4 as uuidv4 } from "uuid";

const TABLE = "cases";

export function submitDeathCertificate(input) {
  const { score, riskBand, signals } = computeRiskScore(input);

  const caseRecord = {
    id: uuidv4(),
    elderlyName: input.elderlyName,
    aadhaarLast4: input.aadhaarLast4 || "XXXX",
    declaredAge: input.declaredAge,
    aadhaarLinkedAge: input.aadhaarLinkedAge ?? null,
    residenceDistrict: input.residenceDistrict,
    registrationDistrict: input.registrationDistrict,
    state: input.state || "Madhya Pradesh",
    pensionScheme: input.pensionScheme || "State Senior Citizen Pension",
    certificateIssueDate: input.certificateIssueDate,
    nextPensionDueDate: input.nextPensionDueDate || null,
    claimFiledDate: input.claimFiledDate || null,
    hospitalRecordFound: input.hospitalRecordFound,
    documentAnomalyDetected: input.documentAnomalyDetected,
    aadhaarActivityAfterDeath: input.aadhaarActivityAfterDeath,
    phoneNumberMasked: input.phoneNumberMasked || null,
    languageCode: input.languageCode || "hi",
    riskScore: score,
    riskBand,
    signals,
    status: riskBand === "HIGH" ? "FLAGGED_UNDER_INVESTIGATION" : riskBand === "MEDIUM" ? "UNDER_REVIEW" : "CLEARED",
    investigationNotes: [],
    submittedAt: new Date().toISOString(),
  };

  insertRow(TABLE, caseRecord);

  appendAuditEntry("CERTIFICATE_SUBMITTED", {
    caseId: caseRecord.id,
    elderlyName: caseRecord.elderlyName,
    district: caseRecord.registrationDistrict,
  });

  appendAuditEntry("RISK_SCORED", {
    caseId: caseRecord.id,
    riskScore: score,
    riskBand,
    triggeredSignals: signals.filter((s) => s.triggered).map((s) => s.key),
  });

  // Component C auto-trigger: HIGH risk cases immediately get a guardian alert,
  // exactly as described in the proposal ("when fraud is suspected, the system
  // immediately sends an alert").
  let triggeredAlert = null;
  if (riskBand === "HIGH") {
    triggeredAlert = sendGuardianAlert({
      caseId: caseRecord.id,
      elderlyName: caseRecord.elderlyName,
      languageCode: caseRecord.languageCode,
      phoneNumberMasked: caseRecord.phoneNumberMasked,
    });
  }

  return { case: caseRecord, alert: triggeredAlert };
}

export function getAllCases() {
  return readTable(TABLE).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getCaseById(id) {
  return findById(TABLE, id);
}

export function updateCaseStatus(id, status, note) {
  const existing = findById(TABLE, id);
  if (!existing) return null;

  const notes = note
    ? [...existing.investigationNotes, { note, at: new Date().toISOString() }]
    : existing.investigationNotes;

  const updated = updateRow(TABLE, id, { status, investigationNotes: notes });

  appendAuditEntry("CASE_STATUS_UPDATED", {
    caseId: id,
    newStatus: status,
    note: note || null,
  });

  return updated;
}

export function getDistrictStats() {
  const cases = readTable(TABLE);
  const byDistrict = {};

  for (const c of cases) {
    const district = c.registrationDistrict || "Unknown";
    if (!byDistrict[district]) {
      byDistrict[district] = { district, total: 0, high: 0, medium: 0, low: 0 };
    }
    byDistrict[district].total += 1;
    if (c.riskBand === "HIGH") byDistrict[district].high += 1;
    else if (c.riskBand === "MEDIUM") byDistrict[district].medium += 1;
    else byDistrict[district].low += 1;
  }

  return Object.values(byDistrict).sort((a, b) => b.high - a.high);
}

export function getSummaryStats() {
  const cases = readTable(TABLE);
  const total = cases.length;
  const high = cases.filter((c) => c.riskBand === "HIGH").length;
  const medium = cases.filter((c) => c.riskBand === "MEDIUM").length;
  const low = cases.filter((c) => c.riskBand === "LOW").length;
  const resolved = cases.filter((c) => c.status === "CLEARED" || c.status === "FRAUD_CONFIRMED").length;
  const fraudConfirmed = cases.filter((c) => c.status === "FRAUD_CONFIRMED").length;

  // Rough illustrative figure for the dashboard: average pension claim
  // value assumed at Rs. 1.2 lakh, used only to show the "value protected"
  // framing from the proposal's impact section. Clearly an estimate, not
  // a real financial computation.
  const estimatedValueProtected = high * 120000;

  return { total, high, medium, low, resolved, fraudConfirmed, estimatedValueProtected };
}
