// src/services/riskEngine.js
//
// Component A: AI Anomaly Detection Engine (prototype version)
//
// A full XGBoost model needs a large labeled dataset of real fraudulent vs
// legitimate death certificates, which does not exist publicly. For this
// prototype we implement a transparent, weighted multi-signal scoring
// model that encodes the exact fraud heuristics described in the proposal.
// Each signal below is the kind of feature a trained classifier would
// learn to weight automatically; here the weights are set by hand so the
// logic is auditable and explainable to a non-technical reviewer (an
// important property for a government fraud system — officers need to
// know *why* a case was flagged, not just that it was).
//
// Swapping this module for a trained model later only requires replacing
// computeRiskScore() — every caller just needs { score, riskBand, signals }.

const SIGNAL_WEIGHTS = {
  districtMismatch: 22, // death registered in a different district than residence
  noHospitalRecord: 28, // no matching hospital discharge/death record
  nearPensionDue: 18, // certificate issued close to a pension/payout due date
  ageInconsistency: 15, // declared age conflicts with Aadhaar-linked age
  rapidClaimFiling: 10, // claim filed unusually fast after certificate issuance
  documentAnomaly: 12, // NLP-detected templated/forged document patterns
  noBiometricInactivity: 10, // Aadhaar biometric still shows recent activity post "death"
};

const MAX_POSSIBLE_SCORE = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * @param {object} cert - death certificate submission
 * @returns {{score:number, riskBand:string, signals:Array<{key:string,label:string,triggered:boolean,weight:number}>}}
 */
export function computeRiskScore(cert) {
  const triggered = [];

  const signalChecks = [
    {
      key: "districtMismatch",
      label: "Death registered in a different district than the person's residence on record",
      test: () => cert.registrationDistrict && cert.residenceDistrict &&
        cert.registrationDistrict.trim().toLowerCase() !== cert.residenceDistrict.trim().toLowerCase(),
    },
    {
      key: "noHospitalRecord",
      label: "No matching hospital discharge or death record found for this certificate",
      test: () => cert.hospitalRecordFound === false,
    },
    {
      key: "nearPensionDue",
      label: "Certificate issued within days of the next pension disbursement date",
      test: () => {
        if (!cert.certificateIssueDate || !cert.nextPensionDueDate) return false;
        const issue = new Date(cert.certificateIssueDate);
        const due = new Date(cert.nextPensionDueDate);
        const diffDays = Math.abs((due - issue) / (1000 * 60 * 60 * 24));
        return diffDays <= 5;
      },
    },
    {
      key: "ageInconsistency",
      label: "Declared age at death conflicts with Aadhaar-linked age record",
      test: () => cert.declaredAge != null && cert.aadhaarLinkedAge != null &&
        Math.abs(Number(cert.declaredAge) - Number(cert.aadhaarLinkedAge)) >= 3,
    },
    {
      key: "rapidClaimFiling",
      label: "Pension/insurance claim filed unusually fast after certificate issuance",
      test: () => {
        if (!cert.certificateIssueDate || !cert.claimFiledDate) return false;
        const issue = new Date(cert.certificateIssueDate);
        const filed = new Date(cert.claimFiledDate);
        const diffDays = (filed - issue) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 2;
      },
    },
    {
      key: "documentAnomaly",
      label: "Document text matches templated/forged certificate patterns (NLP scan)",
      test: () => cert.documentAnomalyDetected === true,
    },
    {
      key: "noBiometricInactivity",
      label: "Aadhaar biometric activity detected after the declared date of death",
      test: () => cert.aadhaarActivityAfterDeath === true,
    },
  ];

  let rawScore = 0;
  for (const check of signalChecks) {
    const isTriggered = Boolean(check.test());
    if (isTriggered) rawScore += SIGNAL_WEIGHTS[check.key];
    triggered.push({
      key: check.key,
      label: check.label,
      triggered: isTriggered,
      weight: SIGNAL_WEIGHTS[check.key],
    });
  }

  const score = clamp(Math.round((rawScore / MAX_POSSIBLE_SCORE) * 100), 0, 100);

  let riskBand = "LOW";
  if (score >= 65) riskBand = "HIGH";
  else if (score >= 35) riskBand = "MEDIUM";

  return { score, riskBand, signals: triggered };
}

export { SIGNAL_WEIGHTS, MAX_POSSIBLE_SCORE };
