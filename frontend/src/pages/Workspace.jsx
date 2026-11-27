import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../store.jsx";
import {
  Pill,
  RecPill,
  Loading,
  ErrorBox,
  Empty,
  Gauge,
} from "../components/ui.jsx";
import ShapChart from "../components/ShapChart.jsx";
import {
  level,
  recommend,
  fmt,
  explain,
  factors,
  top,
  STRIPE,
  STATUSES,
  ST,
} from "../lib.js";
import { Search, FlaskConical } from "lucide-react";
export default function Workspace() {
  const {
    alerts,
    decisions,
    loading,
    error,
    load,
    record,
    inv,
    startInv,
    markSeen,
  } = useStore();
  const [sp] = useSearchParams();
  const [sel, setSel] = useState(sp.get("alert")),
    [q, setQ] = useState(""),
    [atk, setAtk] = useState(""),
    [sev, setSev] = useState(""),
    [st, setSt] = useState(""),
    [choice, setChoice] = useState(null),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (sel) markSeen(sel);
  }, [sel]);
  const done = useMemo(
    () => Object.fromEntries(decisions.map((d) => [d.alertId, d])),
    [decisions],
  );
  const status = (id) =>
    done[id]
      ? done[id].final === "ESCALATE"
        ? "Escalated"
        : "Reviewed"
      : inv.has(id)
        ? "Under Investigation"
        : "Pending";
  const list = alerts.filter(
    (a) =>
      (!q || (a.id + a.src + a.dst).toLowerCase().includes(q.toLowerCase())) &&
      (!atk || a.attack === atk) &&
      (!sev || level(a.score) === sev) &&
      (!st || status(a.id) === st),
  );
  const a = alerts.find((x) => x.id === sel);
  const rec = a && recommend(a.score),
    dec = a && done[a.id],
    ch = choice ?? rec,
    over = a && ch !== rec;
  const pick = (id) => {
    setSel(id);
    setChoice(null);
    setReason("");
    setTimeout(
      () =>
        document
          .getElementById("detail")
          ?.scrollIntoView({ behavior: "smooth" }),
      60,
    );
  };
  const submit = async () => {
    setBusy(true);
    await record(a, {
      recommendation: rec,
      final: ch,
      overridden: over,
      reason: reason.trim() || "Confirmed AI recommendation",
      score: a.score,
      attack: a.attack,
      pred: a.pred,
      summary: explain(a.shap, a.pred),
    });
    setReason("");
    setChoice(null);
    setBusy(false);
  };
  if (loading) return <Loading text="Loading alerts" />;
  if (error) return <ErrorBox msg={error} retry={load} />;
  return (
    <div className="mx-auto grid max-w-8xl gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-5 ">
        <h1 className="text-xl font-semibold text-white">Incoming alerts</h1>
        <div className="relative">
          <Search size={16} className="absolute right-3 top-3 text-slate-500" />
          <input
            className="inp pl-9"
            placeholder="Search alert ID or IP"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <select
            className="inp"
            value={atk}
            onChange={(e) => setAtk(e.target.value)}
          >
            <option value="">Attack</option>
            {[...new Set(alerts.map((x) => x.attack))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            className="inp"
            value={sev}
            onChange={(e) => setSev(e.target.value)}
          >
            <option value="">Severity</option>
            {["Low", "Medium", "High", "Critical"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            className="inp col-span-2 sm:col-span-1"
            value={st}
            onChange={(e) => setSt(e.target.value)}
          >
            <option value="">Status</option>
            {STATUSES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2 lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto lg:overflow-x-hidden px-2 py-2 lg:pr-1">
          {list.length === 0 ? (
            <Empty text="No alerts match these filters." />
          ) : (
            list.map((x) => (
              <button
                key={x.id}
                onClick={() => pick(x.id)}
                className={`card w-full border-l-4 text-left relative transition-all duration-200 ease-out hover:scale-[1.02] hover:z-10 hover:border-cy hover:shadow-lg hover:shadow-cy/10 ${STRIPE[level(x.score)]} ${sel === x.id ? "bg-cy/10 ring-1 ring-cy/60" : ""}`}
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{x.id}</span>
                  <Pill v={level(x.score)} />
                </div>
                <div className="mt-1 font-mono text-xs text-slate-400">
                  {x.src} → {x.dst}
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span>
                    {x.attack} · {x.pred} ({Math.round(x.conf * 100)}%)
                  </span>
                  <span className={ST[status(x.id)]}>{status(x.id)}</span>
                </div>
                <div className="text-xs text-slate-500">{fmt(x.ts)}</div>
              </button>
            ))
          )}
        </div>
      </section>
      <section id="detail" className="min-w-0 scroll-mt-20">
        {!a ? (
          <div className="card">
            <Empty text="Select an alert to investigate." />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-white">{a.id} details</h2>
                <ol className="flex flex-wrap gap-1 text-xs">
                  {STATUSES.map((s) => (
                    <li
                      key={s}
                      className={`rounded-full border px-2 py-0.5 ${status(a.id) === s ? "border-cy bg-cy/10 text-cy" : "border-line text-slate-500"}`}
                    >
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                {[
                  ["Source", `${a.src}:${a.sport}`],
                  ["Destination", `${a.dst}:${a.dport}`],
                  ["Protocol", a.proto],
                  ...Object.entries(a.features),
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="break-words text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-white">SHAP explanation</h2>
                <span className="flex items-center gap-1 rounded-full border border-info/40 px-2 py-0.5 text-xs text-info">
                  <FlaskConical size={12} />
                  Sample data, not model output
                </span>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                Positive values push toward the Malicious class; negative values
                push toward Benign. Output space: {a.space} (sample setting;
                must match the trained model's SHAP configuration).
              </p>
              <ShapChart shap={a.shap} base={a.base} space={a.space} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white">
                    Feature importance
                  </h3>
                  <ol className="space-y-1 text-sm">
                    {top(a.shap, 8).map((s, i) => (
                      <li
                        key={s.feature}
                        className="flex justify-between gap-2"
                      >
                        <span>
                          {i + 1}. {s.feature}
                        </span>
                        <span className={s.value > 0 ? "text-bad" : "text-ok"}>
                          {s.value > 0 ? "+" : ""}
                          {s.value.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="rounded-lg bg-bg/60 p-3 text-sm text-slate-300">
                  {explain(a.shap, a.pred)}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="grid items-center gap-4 md:grid-cols-[auto_1fr]">
                <div className="mx-auto">
                  <Gauge score={a.score} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-white">
                      Risk assessment
                    </h2>
                    <Pill v={level(a.score)} />
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
                    {factors(a).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <details className="mt-4 rounded-lg border border-line p-3 text-sm">
                <summary className="cursor-pointer font-medium text-white">
                  How was this risk score determined?
                </summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-1 pr-2 font-medium">Factor</th>
                        <th className="pr-2 font-medium">Weight</th>
                        <th className="pr-2 font-medium">Value (0–1)</th>
                        <th className="font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.risk.map((r) => (
                        <tr key={r.name} className="border-t border-line">
                          <td className="py-1 pr-2">{r.name}</td>
                          <td className="pr-2">{r.weight}</td>
                          <td className="pr-2">{r.value.toFixed(2)}</td>
                          <td>{r.points}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-line font-medium text-white">
                        <td className="py-1" colSpan={3}>
                          Final risk score
                        </td>
                        <td>{a.score}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Thresholds: Low below 35, Medium 35–59, High 60–79, Critical
                  80+. Recommendation: Ignore below 35, Monitor 35–64, Escalate
                  65+. SHAP values are not part of this calculation.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sample methodology for the demo. Replace with the documented
                  Risk Assessment Module output.
                </p>
              </details>
            </div>
            <div className="card">
              <h2 className="mb-3 font-semibold text-white">
                Administrator review
              </h2>
              <div className="rounded-lg border border-line p-3">
                <div className="text-xs text-slate-500">AI recommendation</div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <RecPill v={rec} />
                  <span className="text-sm text-slate-300">
                    Risk {a.score}/100 ({level(a.score)}); leading factor:{" "}
                    {top(a.shap, 1)[0].feature}.
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-line p-3">
                <div className="text-xs text-slate-500">
                  Administrator's final decision
                </div>
                {dec ? (
                  <div className="mt-1 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <RecPill v={dec.final} />
                      {dec.overridden && (
                        <span className="text-xs text-warn">Overrode AI</span>
                      )}
                    </div>
                    <div className="text-slate-400">Reason: {dec.reason}</div>
                    <div className="text-xs text-slate-500">{fmt(dec.ts)}</div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {status(a.id) === "Pending" && (
                      <button
                        className="btn mb-3 border border-info/50 text-info hover:bg-info/10"
                        onClick={() => startInv(a.id)}
                      >
                        Start investigation
                      </button>
                    )}
                    <h3 className="text-sm font-medium text-white">
                      Select final decision
                    </h3>
                    {["IGNORE", "MONITOR", "ESCALATE"].map((x) => (
                      <label
                        key={x}
                        className="flex cursor-pointer items-center gap-3 py-1.5 text-sm"
                      >
                        <input
                          type="radio"
                          name="fd"
                          className="h-4 w-4 accent-cyan-400"
                          checked={ch === x}
                          onChange={() => setChoice(x)}
                        />
                        {x[0] + x.slice(1).toLowerCase()}
                        {x === rec && (
                          <span className="text-xs text-cy">
                            AI recommended
                          </span>
                        )}
                      </label>
                    ))}
                    <h3 className="mt-3 text-sm font-medium text-white">
                      Reason for decision
                      {over && (
                        <span className="text-warn">
                          {" "}
                          (required to override)
                        </span>
                      )}
                    </h3>
                    <textarea
                      className="inp mt-1"
                      rows={3}
                      placeholder="Why are you confirming or overriding?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <button
                      disabled={busy || (over && !reason.trim())}
                      onClick={submit}
                      className="btn mt-3 w-full bg-cy font-semibold text-bg disabled:opacity-40"
                    >
                      {busy
                        ? "Saving…"
                        : over
                          ? "Override and record decision"
                          : "Confirm administrator decision"}
                    </button>
                    <p className="mt-2 text-xs text-slate-500">
                      Recording a decision does not block IPs or change network
                      traffic.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
