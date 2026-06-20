// src/services/alertService.js
//
// Component C: Guardian Alert System (prototype/simulation version)
//
// The proposal specifies real Twilio/AWS Connect IVR calls with AI voice
// synthesis in regional languages. A live phone system needs a paid
// telephony account, verified numbers, and carrier approval — none of
// which are realistic to wire up for a hackathon demo, and a failed live
// call mid-demo would undermine the pitch far more than a clearly-labeled
// simulation would.
//
// This module simulates the full alert lifecycle (message generation,
// regional-language templating, delivery, and the 1-button alive
// confirmation) so the *logic and UX* are fully demonstrable end-to-end.
// Swapping in real Twilio calls later only means replacing sendAlert()'s
// internals with an actual API call — the rest of the system (flagging,
// dashboard, audit trail) does not need to change.

import { insertRow, readTable, updateRow, findById } from "../db/jsonStore.js";
import { appendAuditEntry } from "./auditTrail.js";
import { v4 as uuidv4 } from "uuid";

const TABLE = "alerts";

const REGIONAL_TEMPLATES = {
  hi: (name) =>
    `${name} ji, namaste. Aapke pension record mein ek sandigdh maut praman patra dikha hai. Kripya confirm karein ki aap surakshit hain. Sahi hone par 1 dabayein.`,
  mr: (name) =>
    `${name} ji, namaskar. Tumchya pension nondi madhe ek sandigdha mrutyu certificate aadhalla aahe. Krupaya 1 daba, tumhi surakshit asal tar.`,
  ta: (name) =>
    `${name} avargale, vanakkam. Ungal pension record-il oru sandhega irappu sandhirojini kandupidikkapattadhu. Neengal pathukappaaga irundhal 1-ai azhutthavum.`,
  bn: (name) =>
    `${name} ji, namaskar. Apnar pension record-e ekti sandehojanak mrityu sanshapotro paowa gechhe. Apni nirapod thakle 1 chapun.`,
  en: (name) =>
    `Dear ${name}, a suspicious death certificate was found linked to your pension record. If you are safe, please press 1 to confirm.`,
};

export function sendGuardianAlert({ caseId, elderlyName, languageCode = "hi", phoneNumberMasked }) {
  const lang = REGIONAL_TEMPLATES[languageCode] ? languageCode : "en";
  const messageText = REGIONAL_TEMPLATES[lang](elderlyName);

  const alert = {
    id: uuidv4(),
    caseId,
    elderlyName,
    languageCode: lang,
    phoneNumberMasked: phoneNumberMasked || "+91-XXXXXXX" + String(Math.floor(1000 + Math.random() * 9000)).slice(-3),
    messageText,
    deliveryChannel: "IVR_SIMULATED",
    status: "SENT",
    sentAt: new Date().toISOString(),
    respondedAt: null,
    response: null, // "ALIVE_CONFIRMED" | "NO_RESPONSE" | null
  };

  insertRow(TABLE, alert);

  appendAuditEntry("GUARDIAN_ALERT_SENT", {
    alertId: alert.id,
    caseId,
    languageCode: lang,
    phoneNumberMasked: alert.phoneNumberMasked,
  });

  return alert;
}

export function recordAlertResponse(alertId, response) {
  const alert = findById(TABLE, alertId);
  if (!alert) return null;

  const updated = updateRow(TABLE, alertId, {
    respondedAt: new Date().toISOString(),
    response,
    status: "RESPONDED",
  });

  appendAuditEntry("GUARDIAN_ALERT_RESPONSE", {
    alertId,
    caseId: alert.caseId,
    response,
  });

  return updated;
}

export function getAlertsForCase(caseId) {
  return readTable(TABLE).filter((a) => a.caseId === caseId);
}

export function getAllAlerts() {
  return readTable(TABLE);
}
