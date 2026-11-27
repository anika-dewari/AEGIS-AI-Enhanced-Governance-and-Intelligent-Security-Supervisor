import { useState } from "react";
import { useStore } from "../store.jsx";
import { Pill, RecPill, Empty, Loading } from "../components/ui.jsx";
import ShapChart from "../components/ShapChart.jsx";
import { level, fmt, STRIPE } from "../lib.js";
import { X } from "lucide-react";
export default function History() {
  const { decisions, loading } = useStore();
  const [q, setQ] = useState(""),
    [atk, setAtk] = useState(""),
    [lv, setLv] = useState(""),
    [dc, setDc] = useState(""),
    [date, setDate] = useState(""),
    [open, setOpen] = useState(null);
  if (loading) return <Loading />;
  const rows = decisions.filter((d) => {
    const s = d.snapshot;
    return (
      (!q ||
        (d.alertId + s.src + s.dst).toLowerCase().includes(q.toLowerCase())) &&
      (!atk || d.attack === atk) &&
      (!lv || level(d.score) === lv) &&
      (!dc || d.final === dc) &&
      (!date || d.ts.slice(0, 10) === date)
    );
  });
  const o = decisions.find((d) => d.id === open);
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <h1 className="text-xl font-semibold text-white">Decision history</h1>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="inp"
          placeholder="Alert ID or IP"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="date"
          className="inp"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="inp"
          value={atk}
          onChange={(e) => setAtk(e.target.value)}
        >
          <option value="">Attack type</option>
          {[
            "DDoS",
            "Port Scan",
            "Brute Force",
            "Web Attack",
            "Bot",
            "Benign",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          className="inp"
          value={lv}
          onChange={(e) => setLv(e.target.value)}
        >
          <option value="">Risk level</option>
          {["Low", "Medium", "High", "Critical"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          className="inp"
          value={dc}
          onChange={(e) => setDc(e.target.value)}
        >
          <option value="">Decision</option>
          {["IGNORE", "MONITOR", "ESCALATE"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div
        className={`card overflow-x-auto p-0 ${rows.length ? "hidden md:block" : ""}`}
      >
        {rows.length === 0 ? (
          <Empty
            text={
              decisions.length
                ? "No records match these filters."
                : "No decisions yet. Record one in the Supervisor Workspace."
            }
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                {[
                  "Decision",
                  "Alert",
                  "Time",
                  "Attack",
                  "Prediction",
                  "Risk",
                  "Severity",
                  "Explanation summary",
                  "AI recommended",
                  "Final",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap p-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setOpen(d.id)}
                  className="cursor-pointer border-t border-line hover:bg-line/40"
                >
                  <td className="p-3 font-mono text-xs">{d.id}</td>
                  <td className="p-3">{d.alertId}</td>
                  <td className="whitespace-nowrap p-3">{fmt(d.ts)}</td>
                  <td className="p-3">{d.attack}</td>
                  <td className="p-3">{d.pred}</td>
                  <td className="p-3">{d.score}</td>
                  <td className="p-3">
                    <Pill v={level(d.score)} />
                  </td>
                  <td className="max-w-xs truncate p-3 text-slate-400">
                    {d.summary}
                  </td>
                  <td className="p-3">
                    <RecPill v={d.recommendation} />
                  </td>
                  <td className="p-3">
                    <RecPill v={d.final} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="space-y-2 md:hidden">
        {rows.map((d) => (
          <button
            key={d.id}
            onClick={() => setOpen(d.id)}
            className={`card w-full border-l-4 text-left ${STRIPE[level(d.score)]}`}
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-white">
                {d.id} · {d.alertId}
              </span>
              <Pill v={level(d.score)} />
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {d.attack} · risk {d.score} · {fmt(d.ts)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              AI <RecPill v={d.recommendation} /> Final <RecPill v={d.final} />
            </div>
          </button>
        ))}
      </div>
      {o && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-5 shadow-2xl">
          <div className="flex justify-between">
            <h2 className="font-semibold text-white">
              {o.id} · {o.alertId}
            </h2>
            <button aria-label="Close" onClick={() => setOpen(null)}>
              <X />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {o.snapshot.src} → {o.snapshot.dst} · {fmt(o.ts)}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Pill v={level(o.score)} />
            <span>Risk {o.score}/100</span>
            <RecPill v={o.recommendation} />
            <span className="text-slate-500">→</span>
            <RecPill v={o.final} />
          </div>
          <h3 className="mt-4 text-sm font-medium text-white">
            Original traffic
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">Source</dt>
              <dd className="font-mono">
                {o.snapshot.src}:{o.snapshot.sport}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Destination</dt>
              <dd className="font-mono">
                {o.snapshot.dst}:{o.snapshot.dport}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Protocol</dt>
              <dd>{o.snapshot.proto}</dd>
            </div>
            {Object.entries(o.snapshot.features).map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-4 text-sm font-medium text-white">
            NIDS prediction
          </h3>
          <p className="text-sm">
            {o.snapshot.attack} · {o.pred} ({Math.round(o.snapshot.conf * 100)}%
            confidence)
          </p>
          <h3 className="mt-4 text-sm font-medium text-white">
            SHAP explanation
          </h3>
          <p className="mt-1 text-sm text-slate-300">{o.summary}</p>
          <h3 className="mt-4 text-sm font-medium text-white">
            Administrator's reason
          </h3>
          <p className="text-sm text-slate-300">{o.reason}</p>
          <div className="mt-4">
            <ShapChart
              shap={o.snapshot.shap}
              base={o.snapshot.base}
              space={o.snapshot.space}
            />
          </div>
          <p className="text-xs text-slate-500">
            Snapshot preserved from the time of the decision (sample data).
          </p>
        </div>
      )}
    </div>
  );
}
