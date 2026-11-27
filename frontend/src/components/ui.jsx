import { LV, REC } from "../lib.js";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
export const Pill = ({ v, map = LV }) => (
  <span
    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${map[v]}`}
  >
    {v}
  </span>
);
export const RecPill = ({ v }) => <Pill v={v} map={REC} />;
export const Loading = ({ text = "Loading" }) => (
  <div className="flex items-center gap-2 p-8 text-slate-400">
    <Loader2 className="animate-spin" size={18} />
    {text}…
  </div>
);
export const ErrorBox = ({ msg, retry }) => (
  <div className="card flex items-center gap-3 border-bad/40">
    <AlertTriangle className="text-bad" />
    <div className="flex-1 text-sm">
      {msg || "Could not reach the data service."}
    </div>
    {retry && (
      <button className="btn bg-line" onClick={retry}>
        Retry
      </button>
    )}
  </div>
);
export const Empty = ({ text }) => (
  <div className="flex flex-col items-center gap-2 p-8 text-sm text-slate-500">
    <Inbox />
    {text}
  </div>
);
export const Gauge = ({ score }) => {
  const c =
    score >= 80
      ? "#f87171"
      : score >= 60
        ? "#fb923c"
        : score >= 35
          ? "#fbbf24"
          : "#34d399";
  const r = 70,
    L = Math.PI * r;
  return (
    <svg viewBox="0 0 180 105" className="w-56">
      <path
        d="M20 90A70 70 0 0 1 160 90"
        fill="none"
        stroke="#1c2a44"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M20 90A70 70 0 0 1 160 90"
        fill="none"
        stroke={c}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${(L * score) / 100} ${L}`}
        style={{ transition: "stroke-dasharray .6s" }}
      />
      <text
        x="90"
        y="82"
        textAnchor="middle"
        fill="#fff"
        fontSize="34"
        fontWeight="700"
      >
        {score}
      </text>
      <text x="90" y="100" textAnchor="middle" fill="#94a3b8" fontSize="10">
        out of 100
      </text>
    </svg>
  );
};
