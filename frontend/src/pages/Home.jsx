import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import { Pill, RecPill, Loading, ErrorBox } from "../components/ui.jsx";
import { level, recommend, fmt, STRIPE } from "../lib.js";
import {
  Network,
  ScanSearch,
  Bot,
  BarChart3,
  Gauge,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
const FLOW = [
  [
    ScanSearch,
    "NIDS",
    "Detects suspicious traffic and raises alerts",
    "/workspace",
  ],
  [
    Bot,
    "Supervisor Agent",
    "Receives each alert and coordinates the checks",
    "/workspace",
  ],
  [
    BarChart3,
    "SHAP + Risk",
    "Explains why it was flagged and scores how serious it is",
    "/workspace",
  ],
  [
    Gauge,
    "Recommendation",
    "Suggests ignore, monitor or escalate",
    "/workspace",
  ],
  [
    ShieldCheck,
    "Administrator",
    "Confirms or overrides the recommendation",
    "/workspace",
  ],
  [
    ClipboardList,
    "Decision History",
    "Keeps the full decision trail",
    "/history",
  ],
];
const DOT = { online: "bg-ok", offline: "bg-bad", unverified: "bg-slate-500" };
const Radar = () => (
  <svg viewBox="0 0 200 200" className="w-52 shrink-0 sm:w-64">
    <defs>
      <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="1" stopColor="#22d3ee" stopOpacity=".5" />
      </linearGradient>
    </defs>
    {[95, 70, 45, 20].map((r) => (
      <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#1c2a44" />
    ))}
    <path d="M100 5V195M5 100H195" stroke="#1c2a44" />
    <g className="sweep">
      <path d="M100 100L100 5A95 95 0 0 1 167 33Z" fill="url(#sw)" />
    </g>
    <circle cx="140" cy="62" r="4" fill="#f87171" />
    <circle cx="62" cy="128" r="3" fill="#fb923c" />
    <circle cx="118" cy="146" r="3" fill="#34d399" />
    <circle cx="76" cy="70" r="3" fill="#34d399" />
  </svg>
);
export default function Home() {
  const { alerts, decisions, health, loading, error, load, unseen } =
    useStore();
  const go = useNavigate();
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} retry={load} />;
  const stats = [
    ["Total alerts processed", alerts.length, ""],
    [
      "Critical alerts",
      alerts.filter((a) => level(a.score) === "Critical").length,
      "text-bad",
    ],
    [
      "Under monitoring",
      decisions.filter((d) => d.final === "MONITOR").length,
      "text-info",
    ],
    [
      "Escalated",
      decisions.filter((d) => d.final === "ESCALATE").length,
      "text-warn",
    ],
    ["Decisions made", decisions.length, "text-cy"],
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="card flex flex-col items-center gap-6 p-6 sm:p-10 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            AEGIS AI
          </h1>
          <p className="mt-1 text-base text-slate-300 sm:text-lg">
            AI Enhanced Governance and Intelligent Security Supervisor
          </p>
          <p className="mt-3 font-display text-xl text-cy">
            Intelligent. Explainable. Risk-Aware.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 md:mx-0">
            AEGIS reviews NIDS alerts, explains each one with SHAP, scores the
            risk, and recommends ignore, monitor or escalate. An administrator
            makes every final decision.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/workspace"
              className="btn bg-cy text-center font-semibold text-bg hover:bg-cyan-300 hover:scale-105 transition-transform duration-200"
            >
              Open Supervisor Workspace
            </Link>
            <Link
              to="/history"
              className="btn border border-line text-center hover:bg-line/50 hover:scale-105 transition-transform duration-200 "
            >
              View Decision History
            </Link>
          </div>
        </div>
        <Radar />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          How an alert is handled
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {FLOW.map(([I, t, d, to], i) => (
            <Link
              key={t}
              to={to}
              title={d}
              className="card group relative flex items-start gap-3 !p-3 transition-transform duration-200 hover:scale-105 hover:border-cy/50 lg:flex-col lg:items-center lg:text-center"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cy/10 text-cy ring-1 ring-cy/30 transition group-hover:bg-cy/20">
                <I size={18} />
              </span>
              <span>
                <span className="block text-sm text-white">{t}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{d}</span>
              </span>
              {i < 5 && (
                <ChevronRight
                  size={16}
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-cy lg:block"
                />
              )}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">System health</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {health.map((h) => (
            <div key={h.key} className="card flex items-center gap-3 !p-4  hover:border-cy/50 hover:scale-105 transition-transform duration-200">
              <span className={`h-2.5 w-2.5 rounded-full ${DOT[h.status]}`} />
              <div>
                <div className="text-sm text-white">{h.name}</div>
                <div className="text-xs text-slate-500">
                  {h.status === "unverified"
                    ? "Not verified (mock mode)"
                    : h.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([t, v, c], i) => (
          <div
            key={t}
            className={`card !p-4 ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <div
              className={`font-display text-3xl font-bold ${c || "text-white"}`}
            >
              {v}
            </div>
            <div className="mt-1 text-xs text-slate-400">{t}</div>
          </div>
        ))}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent activity{" "}
            <span className="text-xs font-normal text-slate-500">
              sample data
            </span>
            {unseen > 0 && (
              <span className="ml-2 rounded-full bg-bad px-2 py-0.5 text-xs font-medium text-white">
                {unseen} new
              </span>
            )}
          </h2>
          <Link to="/workspace"
              className="btn bg-cy text-center font-semibold text-bg hover:bg-cyan-300 hover:scale-105 transition-transform duration-200"
            >
              Open Workspace
            </Link>
        </div>
        <div className="hidden card overflow-x-auto !p-0 md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                {[
                  "Alert",
                  "Attack type",
                  "Severity",
                  "Supervisor decision",
                  "Time",
                ].map((h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 5).map((a) => (
                <tr
                  key={a.id}
                  onClick={() => go(`/workspace?alert=${a.id}`)}
                  className="cursor-pointer border-t border-line hover:bg-line/40"
                >
                  <td className="p-3 font-mono text-xs">{a.id}</td>
                  <td className="p-3">{a.attack}</td>
                  <td className="p-3">
                    <Pill v={level(a.score)} />
                  </td>
                  <td className="p-3">
                    <RecPill v={recommend(a.score)} />
                  </td>
                  <td className="p-3 text-slate-400">{fmt(a.ts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 md:hidden">
          {alerts.slice(0, 5).map((a) => (
            <div
              key={a.id}
              onClick={() => go(`/workspace?alert=${a.id}`)}
              role="button"
              className={`card cursor-pointer border-l-4 !p-3 ${STRIPE[level(a.score)]}`}
            >
              <div className="flex justify-between text-sm">
                <span className="font-mono text-white">{a.id}</span>
                <Pill v={level(a.score)} />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {a.attack} · {fmt(a.ts)}
                </span>
                <RecPill v={recommend(a.score)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
