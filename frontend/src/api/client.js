// src/api/client.js
const BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getCases: () => request("/cases"),
  getCase: (id) => request(`/cases/${id}`),
  submitCase: (payload) => request("/cases", { method: "POST", body: JSON.stringify(payload) }),
  updateCaseStatus: (id, status, note) =>
    request(`/cases/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),
  getAlertsForCase: (id) => request(`/cases/${id}/alerts`),
  respondToAlert: (alertId, response) =>
    request(`/alerts/${alertId}/respond`, { method: "POST", body: JSON.stringify({ response }) }),
  getSummary: () => request("/stats/summary"),
  getDistrictStats: () => request("/stats/districts"),
  getAuditTrail: () => request("/audit-trail"),
  verifyAuditTrail: () => request("/audit-trail/verify"),
};
