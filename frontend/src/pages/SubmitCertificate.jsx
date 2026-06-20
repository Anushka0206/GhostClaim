import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";

const DISTRICTS = ["Indore", "Bhopal", "Khargone", "Vidisha", "Dhar", "Pune", "Chennai", "Kolkata", "Howrah"];
const LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "bn", label: "Bengali" },
  { code: "en", label: "English" },
];

const initialForm = {
  elderlyName: "",
  aadhaarLast4: "",
  declaredAge: "",
  aadhaarLinkedAge: "",
  residenceDistrict: "Indore",
  registrationDistrict: "Indore",
  pensionScheme: "State Senior Citizen Pension",
  certificateIssueDate: "",
  nextPensionDueDate: "",
  claimFiledDate: "",
  hospitalRecordFound: true,
  documentAnomalyDetected: false,
  aadhaarActivityAfterDeath: false,
  languageCode: "hi",
};

function validateForm(form) {
  const errors = {};

  if (!form.elderlyName.trim()) {
    errors.elderlyName = "Name is required.";
  } else if (form.elderlyName.trim().length < 2) {
    errors.elderlyName = "Name must be at least 2 characters.";
  }

  if (!form.aadhaarLast4) {
    errors.aadhaarLast4 = "Last 4 digits are required.";
  } else if (!/^\d{4}$/.test(form.aadhaarLast4)) {
    errors.aadhaarLast4 = "Enter exactly 4 numeric digits.";
  }

  if (!form.declaredAge) {
    errors.declaredAge = "Age is required.";
  } else {
    const age = Number(form.declaredAge);
    if (isNaN(age) || age < 60 || age > 120) {
      errors.declaredAge = "Age must be between 60 and 120 for pension eligibility.";
    }
  }

  if (form.aadhaarLinkedAge) {
    const linkedAge = Number(form.aadhaarLinkedAge);
    if (isNaN(linkedAge) || linkedAge < 60 || linkedAge > 120) {
      errors.aadhaarLinkedAge = "Aadhaar-linked age must be between 60 and 120.";
    }
  }

  if (!form.certificateIssueDate) {
    errors.certificateIssueDate = "Certificate issue date is required.";
  }

  if (form.residenceDistrict === form.registrationDistrict) {
    // no error — same district is fine
  }

  return errors;
}

export default function SubmitCertificate() {
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        const updatedForm = { ...form, [field]: value };
        const fieldErrors = validateForm(updatedForm);
        if (fieldErrors[field]) next[field] = fieldErrors[field];
        else delete next[field];
        return next;
      });
    }
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
    const fieldErrors = validateForm(form);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldErrors[field]) next[field] = fieldErrors[field];
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allErrors = validateForm(form);
    setErrors(allErrors);
    setTouched({
      elderlyName: true,
      aadhaarLast4: true,
      declaredAge: true,
      aadhaarLinkedAge: true,
      certificateIssueDate: true,
    });

    if (Object.keys(allErrors).length > 0) {
      toast("Please fix the highlighted fields before submitting.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        declaredAge: Number(form.declaredAge),
        aadhaarLinkedAge: form.aadhaarLinkedAge ? Number(form.aadhaarLinkedAge) : null,
      };
      const res = await api.submitCase(payload);
      setResult(res);
      toast(
        `Certificate scored ${res.case.riskBand} risk (${res.case.riskScore}/100)`,
        res.case.riskBand === "HIGH" ? "warning" : res.case.riskBand === "MEDIUM" ? "warning" : "success"
      );
      if (res.alert) {
        toast("Guardian alert automatically sent to registered phone number.", "info");
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="px-4 md:px-8 py-7 max-w-[640px]">
        <div className="bg-white rounded-lg border border-ink-100 shadow-panel p-6 md:p-7 text-center">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
              result.case.riskBand === "HIGH" ? "bg-alert-50" : result.case.riskBand === "MEDIUM" ? "bg-amber-50" : "bg-safe-50"
            }`}
          >
            <span className="text-2xl font-extrabold">{result.case.riskScore}</span>
          </div>
          <h2 className="text-lg font-bold text-ink-900">
            Certificate scored {result.case.riskBand} risk
          </h2>
          <p className="text-sm text-ink-500 mt-2">
            {result.alert
              ? "A guardian alert was automatically sent to the registered phone number."
              : "No guardian alert was needed for this risk level."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => navigate(`/cases/${result.case.id}`)}
              className="px-4 py-2 bg-ink-900 text-white text-sm font-semibold rounded-md"
            >
              View Case Details
            </button>
            <button
              onClick={() => {
                setResult(null);
                setForm(initialForm);
                setErrors({});
                setTouched({});
              }}
              className="px-4 py-2 border border-ink-100 text-ink-700 text-sm font-semibold rounded-md"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-7 max-w-[720px]">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-ink-900">Register Death Certificate</h1>
        <p className="mt-1 text-sm text-ink-500">
          Simulates a civil registrar entering a certificate. GhostClaim Shield scores it instantly against pension and Aadhaar records.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg border border-ink-100 shadow-panel p-5 md:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Elderly person's name"
            value={form.elderlyName}
            onChange={(v) => update("elderlyName", v)}
            onBlur={() => handleBlur("elderlyName")}
            error={touched.elderlyName ? errors.elderlyName : null}
          />
          <TextField
            label="Aadhaar last 4 digits"
            value={form.aadhaarLast4}
            onChange={(v) => update("aadhaarLast4", v.replace(/\D/g, "").slice(0, 4))}
            onBlur={() => handleBlur("aadhaarLast4")}
            error={touched.aadhaarLast4 ? errors.aadhaarLast4 : null}
            inputMode="numeric"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Declared age at death"
            value={form.declaredAge}
            onChange={(v) => update("declaredAge", v)}
            onBlur={() => handleBlur("declaredAge")}
            error={touched.declaredAge ? errors.declaredAge : null}
          />
          <NumberField
            label="Aadhaar-linked age (if known)"
            value={form.aadhaarLinkedAge}
            onChange={(v) => update("aadhaarLinkedAge", v)}
            onBlur={() => handleBlur("aadhaarLinkedAge")}
            error={touched.aadhaarLinkedAge ? errors.aadhaarLinkedAge : null}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Residence district" value={form.residenceDistrict} onChange={(v) => update("residenceDistrict", v)} options={DISTRICTS} />
          <SelectField label="Registration district" value={form.registrationDistrict} onChange={(v) => update("registrationDistrict", v)} options={DISTRICTS} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DateField
            label="Certificate issued"
            value={form.certificateIssueDate}
            onChange={(v) => update("certificateIssueDate", v)}
            onBlur={() => handleBlur("certificateIssueDate")}
            error={touched.certificateIssueDate ? errors.certificateIssueDate : null}
          />
          <DateField label="Next pension due" value={form.nextPensionDueDate} onChange={(v) => update("nextPensionDueDate", v)} />
          <DateField label="Claim filed" value={form.claimFiledDate} onChange={(v) => update("claimFiledDate", v)} />
        </div>

        <SelectField
          label="Guardian alert language"
          value={form.languageCode}
          onChange={(v) => update("languageCode", v)}
          options={LANGUAGES.map((l) => l.code)}
          renderOption={(code) => LANGUAGES.find((l) => l.code === code).label}
        />

        <div className="border-t border-ink-100 pt-4 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">Cross-check signals (simulated lookups)</div>
          <CheckField
            label="Hospital discharge/death record found"
            checked={form.hospitalRecordFound}
            onChange={(v) => update("hospitalRecordFound", v)}
          />
          <CheckField
            label="NLP scan detected templated/forged document pattern"
            checked={form.documentAnomalyDetected}
            onChange={(v) => update("documentAnomalyDetected", v)}
          />
          <CheckField
            label="Aadhaar biometric activity detected after declared death"
            checked={form.aadhaarActivityAfterDeath}
            onChange={(v) => update("aadhaarActivityAfterDeath", v)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md transition-colors disabled:opacity-50"
        >
          {submitting ? "Scoring…" : "Submit & Run Fraud Check"}
        </button>
      </form>
    </div>
  );
}

function FieldWrapper({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">{label}</span>
      {children}
      {error && (
        <p className="mt-1 text-xs text-alert-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </label>
  );
}

function inputClass(error) {
  return `mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-alert-500 focus:ring-alert-500/30 bg-alert-50/30"
      : "border-ink-100 focus:ring-amber-500/40"
  }`;
}

function TextField({ label, value, onChange, onBlur, error, inputMode }) {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

function NumberField({ label, value, onChange, onBlur, error }) {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

function DateField({ label, value, onChange, onBlur, error }) {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

function SelectField({ label, value, onChange, options, renderOption }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-ink-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-ink-300 text-amber-500 focus:ring-amber-500/40"
      />
      <span className="text-sm text-ink-700">{label}</span>
    </label>
  );
}
