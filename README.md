# GhostClaim Shield

**AI-powered detection of fraudulent death certificates used to steal pensions and insurance of living elderly.**

Built for Bharat Academix CodeQuest 2026 — Round 2: Prototype Development
Team IndoriPohe — Anushka Parihar, Anuj Billore (SGSITS Indore)

---

## What this is

A working full-stack prototype of the system described in our Round 1 proposal. It is scoped to what is honestly buildable and demonstrable in a hackathon prototype window — see **"What's simulated vs. real"** below for exactly where we cut corners and why, so you can speak to it confidently if a judge asks.

## Architecture

```
ghostclaim-shield/
├── backend/     Node.js + Express API — risk engine, audit trail, alerts
├── frontend/    React + Vite + Tailwind — government dashboard UI
└── docs/        (add technical documentation deliverable here)
```

The backend has **no external database** — it persists to JSON files under `backend/src/data/`. This was a deliberate choice: it removes any setup friction (no Postgres install, no native module compilation, which actually failed in the build sandbox), and the storage layer (`backend/src/db/jsonStore.js`) is written so swapping in real PostgreSQL later only touches that one file.

## Running it locally (in Cursor / on your machine)

You need two terminals.

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm run seed     # populates demo cases — run this once, or again to reset data
npm run dev       # starts API on http://localhost:4000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev       # starts UI on http://localhost:5173
```

Open `http://localhost:5173`. The dashboard will load 8 seeded demo cases (4 HIGH risk with guardian alerts already triggered, 4 LOW risk/clean).

## What's implemented (all 4 components from the proposal)

| Component | Proposal | What's built |
|---|---|---|
| A. AI Anomaly Detection Engine | XGBoost/NLP fraud scoring | A transparent, weighted multi-signal scoring engine (`backend/src/services/riskEngine.js`) that checks the exact 7 fraud signals named in the proposal (district mismatch, no hospital record, near-pension-due timing, age inconsistency, rapid claim filing, document anomaly, post-death Aadhaar activity) and produces an explainable 0–100 score + HIGH/MEDIUM/LOW band |
| B. Cross-Database Verification Layer | API simulation to EPFO/LIC/Aadhaar | The registrar form (`Register Certificate` page) collects the cross-check fields a real integration would pull automatically — that integration is mocked as form inputs rather than live API calls, since no public sandbox exists for EPFO/UIDAI |
| C. Guardian Alert System | Twilio/AWS Connect IVR, multilingual | Fully simulated alert lifecycle (`backend/src/services/alertService.js`) — auto-triggers on every HIGH-risk case, generates a regional-language message (Hindi/Marathi/Tamil/Bengali/English templates), and the UI lets you simulate the 1-button "I'm alive" response |
| D. Government Dashboard + Blockchain Audit Trail | Ethereum/Polygon smart contract logging | A real cryptographic hash-chain (`backend/src/services/auditTrail.js`) — SHA-256, each entry links to the previous entry's hash, fully tamper-evident and independently verifiable. This gives the same guarantee a blockchain provides without a live testnet dependency that could fail mid-demo |

## What's simulated vs. real — and why (be ready to say this to judges)

- **Risk scoring is rule-based, not a trained ML model.** A real XGBoost classifier needs thousands of labeled real fraud cases, which don't exist publicly. Our scoring weights encode the same domain signals a trained model would learn — this is honest framing, not a weakness to hide.
- **IVR alerts are simulated, not live phone calls.** Real Twilio calls need a paid account, number verification, and carrier approval — too fragile for a live demo. The full message-generation and response-handling logic is real and working.
- **The audit trail is a SHA-256 hash chain, not a blockchain.** It provides the identical tamper-evidence guarantee (any alteration breaks the chain, verifiably) without depending on a public testnet being up during your demo.
- **EPFO/LIC/Aadhaar cross-checks are form inputs, not live API calls.** No public sandbox exists for these systems; a real deployment would replace the form checkboxes with actual API calls — the verification *logic* downstream is real.

If asked "is this really AI," the honest answer: it's an explainable rules engine standing in for the ML model described in the proposal, which is the correct call for a hackathon timeline — and arguably better for a government fraud system, where officers need to see *why* a case was flagged.

## Suggested demo video flow (3–4 min)

1. Open Dashboard — show stats, district hotspot bars
2. Click into a HIGH-risk case — show the trust meter, signal breakdown ("this is why it's flagged")
3. Show the Guardian Alert panel, click "Press 1 — I'm Alive" to show the hold-investigation flow
4. Go to Register Certificate — submit a fresh certificate live, watch it get scored in real time
5. Go to Audit Trail — show the hash chain, click Re-verify to show integrity check

## Next steps if you want to extend this further

- Add authentication (officer login) before a real deployment
- Replace `jsonStore.js` with PostgreSQL for concurrent multi-user use
- Add the technical documentation PDF/deck (required Round 2 deliverable) — flag this if you want help with it next
