import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your officer name to continue.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    signIn(trimmed);
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-900 border border-ink-700 mb-5">
            <ShieldIcon />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">GhostClaim Shield</h1>
          <p className="mt-2 text-sm text-ink-300 leading-relaxed max-w-xs mx-auto">
            AI-powered fraud detection for fake death certificates targeting elderly pensions.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-900 border border-ink-700 text-[11px] text-ink-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-safe-500 animate-pulse" />
            Bharat Academix CodeQuest 2026
          </div>
        </div>

        {/* Sign-in card */}
        <form
          onSubmit={handleSubmit}
          className="bg-ink-900 border border-ink-700 rounded-xl p-7 shadow-2xl"
        >
          <h2 className="text-white font-bold text-lg mb-1">Officer Sign In</h2>
          <p className="text-ink-300 text-xs mb-5">
            Enter your name to access the Pension Fraud Intelligence Dashboard.
          </p>

          <label className="block mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">Officer Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Rajesh Sharma, District Officer"
              className={`mt-1.5 w-full bg-ink-950 border rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:ring-2 transition-colors ${
                error ? "border-alert-500 focus:ring-alert-500/30" : "border-ink-700 focus:ring-amber-500/30 focus:border-amber-500/50"
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-alert-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {error}
              </p>
            )}
          </label>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md transition-colors text-sm"
          >
            Sign In to Dashboard
          </button>
        </form>

        <p className="text-center text-[11px] text-ink-500 mt-6 leading-relaxed">
          Protect the living. Expose the lie.
          <br />
          Demo prototype — no real authentication required.
        </p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" fill="#D97706" opacity="0.2" />
      <path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" stroke="#D97706" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
