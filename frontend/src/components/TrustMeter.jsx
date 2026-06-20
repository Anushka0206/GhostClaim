// src/components/TrustMeter.jsx
//
// Signature element: an arc-shaped "trust meter" that reads as a dial
// rather than a generic progress bar — appropriate for a tool whose job
// is to render a verdict ("how much do we trust this certificate?") at a
// glance for an officer scanning dozens of cases.

const BAND_COLORS = {
  HIGH: { stroke: "#B91C1C", text: "text-alert-500", bg: "bg-alert-50" },
  MEDIUM: { stroke: "#D97706", text: "text-amber-600", bg: "bg-amber-50" },
  LOW: { stroke: "#15803D", text: "text-safe-600", bg: "bg-safe-50" },
};

export default function TrustMeter({ score, riskBand, size = 88 }) {
  const colors = BAND_COLORS[riskBand] || BAND_COLORS.LOW;
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // semicircle arc length
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path
          d={`M 6 ${center} A ${radius} ${radius} 0 0 1 ${size - 6} ${center}`}
          fill="none"
          stroke="#E5E2D9"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M 6 ${center} A ${radius} ${radius} 0 0 1 ${size - 6} ${center}`}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className={`-mt-5 text-lg font-bold ${colors.text}`}>{score}</div>
      <div className={`mt-0.5 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
        {riskBand}
      </div>
    </div>
  );
}
