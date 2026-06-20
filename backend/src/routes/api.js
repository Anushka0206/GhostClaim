// src/routes/api.js
import { Router } from "express";
import {
  submitDeathCertificate,
  getAllCases,
  getCaseById,
  updateCaseStatus,
  getDistrictStats,
  getSummaryStats,
} from "../services/caseService.js";
import { getAlertsForCase, getAllAlerts, recordAlertResponse } from "../services/alertService.js";
import { getAuditTrail, verifyChainIntegrity } from "../services/auditTrail.js";

const router = Router();

// ---------- Cases ----------

router.post("/cases", (req, res) => {
  try {
    const result = submitDeathCertificate(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/cases", (req, res) => {
  res.json(getAllCases());
});

router.get("/cases/:id", (req, res) => {
  const found = getCaseById(req.params.id);
  if (!found) return res.status(404).json({ error: "Case not found" });
  res.json(found);
});

router.get("/cases/:id/alerts", (req, res) => {
  res.json(getAlertsForCase(req.params.id));
});

router.patch("/cases/:id/status", (req, res) => {
  const { status, note } = req.body;
  const updated = updateCaseStatus(req.params.id, status, note);
  if (!updated) return res.status(404).json({ error: "Case not found" });
  res.json(updated);
});

// ---------- Alerts ----------

router.get("/alerts", (req, res) => {
  res.json(getAllAlerts());
});

router.post("/alerts/:id/respond", (req, res) => {
  const { response } = req.body; // "ALIVE_CONFIRMED" | "NO_RESPONSE"
  const updated = recordAlertResponse(req.params.id, response);
  if (!updated) return res.status(404).json({ error: "Alert not found" });

  // If the elderly person confirms they're alive, auto-hold the linked case.
  if (response === "ALIVE_CONFIRMED") {
    updateCaseStatus(updated.caseId, "INVESTIGATION_HOLD_ALIVE_CONFIRMED", "Elderly citizen confirmed alive via IVR alert response.");
  }

  res.json(updated);
});

// ---------- Stats & Dashboard ----------

router.get("/stats/summary", (req, res) => {
  res.json(getSummaryStats());
});

router.get("/stats/districts", (req, res) => {
  res.json(getDistrictStats());
});

// ---------- Audit Trail (Component D) ----------

router.get("/audit-trail", (req, res) => {
  res.json(getAuditTrail());
});

router.get("/audit-trail/verify", (req, res) => {
  res.json(verifyChainIntegrity());
});

export default router;
