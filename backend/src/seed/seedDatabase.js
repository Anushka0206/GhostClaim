// src/seed/seedDatabase.js
//
// Populates realistic demo data so the dashboard, district heatmap, and
// audit trail aren't empty on first run. Includes a deliberate mix of
// clearly fraudulent, ambiguous, and clean cases so the demo video shows
// the full range of risk bands.

import { resetTable } from "../db/jsonStore.js";
import { submitDeathCertificate } from "../services/caseService.js";

const demoCases = [
  {
    elderlyName: "Kamla Devi",
    aadhaarLast4: "4821",
    declaredAge: 78,
    aadhaarLinkedAge: 71,
    residenceDistrict: "Indore",
    registrationDistrict: "Khargone",
    certificateIssueDate: "2026-06-10",
    nextPensionDueDate: "2026-06-12",
    claimFiledDate: "2026-06-11",
    hospitalRecordFound: false,
    documentAnomalyDetected: true,
    aadhaarActivityAfterDeath: true,
    phoneNumberMasked: "+91-XXXXX-1187",
    languageCode: "hi",
  },
  {
    elderlyName: "Ramesh Patil",
    aadhaarLast4: "7732",
    declaredAge: 82,
    aadhaarLinkedAge: 82,
    residenceDistrict: "Pune",
    registrationDistrict: "Pune",
    certificateIssueDate: "2026-05-02",
    nextPensionDueDate: "2026-07-01",
    claimFiledDate: "2026-05-20",
    hospitalRecordFound: true,
    documentAnomalyDetected: false,
    aadhaarActivityAfterDeath: false,
    phoneNumberMasked: "+91-XXXXX-2290",
    languageCode: "mr",
  },
  {
    elderlyName: "Saraswati Bai",
    aadhaarLast4: "5563",
    declaredAge: 69,
    aadhaarLinkedAge: 69,
    residenceDistrict: "Bhopal",
    registrationDistrict: "Vidisha",
    certificateIssueDate: "2026-06-15",
    nextPensionDueDate: "2026-06-18",
    claimFiledDate: "2026-06-16",
    hospitalRecordFound: false,
    documentAnomalyDetected: true,
    aadhaarActivityAfterDeath: false,
    phoneNumberMasked: "+91-XXXXX-3345",
    languageCode: "hi",
  },
  {
    elderlyName: "Lakshmi Narayanan",
    aadhaarLast4: "9012",
    declaredAge: 75,
    aadhaarLinkedAge: 75,
    residenceDistrict: "Chennai",
    registrationDistrict: "Chennai",
    certificateIssueDate: "2026-04-11",
    nextPensionDueDate: "2026-07-15",
    claimFiledDate: "2026-04-25",
    hospitalRecordFound: true,
    documentAnomalyDetected: false,
    aadhaarActivityAfterDeath: false,
    phoneNumberMasked: "+91-XXXXX-4471",
    languageCode: "ta",
  },
  {
    elderlyName: "Manorama Sen",
    aadhaarLast4: "1290",
    declaredAge: 88,
    aadhaarLinkedAge: 80,
    residenceDistrict: "Kolkata",
    registrationDistrict: "Howrah",
    certificateIssueDate: "2026-06-18",
    nextPensionDueDate: "2026-06-20",
    claimFiledDate: "2026-06-19",
    hospitalRecordFound: false,
    documentAnomalyDetected: true,
    aadhaarActivityAfterDeath: true,
    phoneNumberMasked: "+91-XXXXX-5582",
    languageCode: "bn",
  },
  {
    elderlyName: "Govind Rao",
    aadhaarLast4: "3344",
    declaredAge: 73,
    aadhaarLinkedAge: 71,
    residenceDistrict: "Indore",
    registrationDistrict: "Indore",
    certificateIssueDate: "2026-06-05",
    nextPensionDueDate: "2026-06-28",
    claimFiledDate: "2026-06-14",
    hospitalRecordFound: true,
    documentAnomalyDetected: false,
    aadhaarActivityAfterDeath: false,
    phoneNumberMasked: "+91-XXXXX-6618",
    languageCode: "hi",
  },
  {
    elderlyName: "Fatima Sheikh",
    aadhaarLast4: "8821",
    declaredAge: 80,
    aadhaarLinkedAge: 80,
    residenceDistrict: "Bhopal",
    registrationDistrict: "Bhopal",
    certificateIssueDate: "2026-03-19",
    nextPensionDueDate: "2026-07-01",
    claimFiledDate: "2026-03-30",
    hospitalRecordFound: true,
    documentAnomalyDetected: false,
    aadhaarActivityAfterDeath: false,
    phoneNumberMasked: "+91-XXXXX-7723",
    languageCode: "hi",
  },
  {
    elderlyName: "Bhagwati Yadav",
    aadhaarLast4: "6610",
    declaredAge: 91,
    aadhaarLinkedAge: 84,
    residenceDistrict: "Indore",
    registrationDistrict: "Dhar",
    certificateIssueDate: "2026-06-17",
    nextPensionDueDate: "2026-06-19",
    claimFiledDate: "2026-06-18",
    hospitalRecordFound: false,
    documentAnomalyDetected: true,
    aadhaarActivityAfterDeath: true,
    phoneNumberMasked: "+91-XXXXX-8834",
    languageCode: "hi",
  },
];

function seed() {
  resetTable("cases");
  resetTable("alerts");
  resetTable("auditTrail");

  console.log("Seeding GhostClaim Shield demo data...\n");

  for (const demo of demoCases) {
    const { case: created, alert } = submitDeathCertificate(demo);
    console.log(
      `  [${created.riskBand.padEnd(6)}] ${created.elderlyName.padEnd(20)} score=${created.riskScore} district=${created.registrationDistrict}` +
        (alert ? "  -> guardian alert sent" : "")
    );
  }

  console.log("\nSeed complete.");
}

seed();
