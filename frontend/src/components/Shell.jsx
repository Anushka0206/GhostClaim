import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: GridIcon },
  { to: "/submit", label: "Register Certificate", icon: FilePlusIcon },
  { to: "/audit-trail", label: "Audit Trail", icon: ChainIcon },
];

export default function Shell({ children }) {
  const { officer, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleSignOut() {
    signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-ink-950/50 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-ink-950 text-ink-100 flex flex-col transform transition-transform duration-200 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 border-b border-ink-900">
          <div className="flex items-center gap-2.5">
            <ShieldIcon />
            <div>
              <div className="font-bold text-white text-[15px] leading-tight">GhostClaim Shield</div>
              <div className="text-[11px] text-ink-300 tracking-wide">Bharat Academix CodeQuest 2026</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-700 text-white"
                    : "text-ink-300 hover:bg-ink-900 hover:text-ink-100"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-ink-900">
          {officer && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Signed in as</div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">{officer.name}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="text-[11px] text-ink-300 hover:text-white transition-colors mb-3 block"
          >
            Sign out
          </button>
          <div className="text-[11px] text-ink-300 leading-relaxed">
            Protect the living.
            <br />
            Expose the lie.
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-ink-100 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 rounded-md text-ink-700 hover:bg-ink-50"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="font-bold text-ink-900 text-sm">GhostClaim Shield</div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"
        fill="#D97706"
        opacity="0.18"
      />
      <path
        d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"
        stroke="#D97706"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FilePlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M6 2h9l5 5v15H6V2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v6M9 13h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="9" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="9" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
