import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from "recharts";
export default function ShapChart({ shap, base, space }) {
  const d = [...shap].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return (
    <div>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={d} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              domain={["auto", "auto"]}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={130}
              stroke="#94a3b8"
              fontSize={11}
            />
            <ReferenceLine x={0} stroke="#64748b" />
            <Tooltip
              cursor={{ fill: "#1c2a44" }}
              contentStyle={{
                background: "#0e1729",
                border: "1px solid #1c2a44",
              }}
              formatter={(v) => [v.toFixed(3), "SHAP value"]}
            />
            <Bar dataKey="value" radius={3}>
              {d.map((x, i) => (
                <Cell key={i} fill={x.value > 0 ? "#f87171" : "#34d399"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-400">
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-bad" />
          Toward malicious
        </span>
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-ok" />
          Toward benign
        </span>
      </div>
      {base !== undefined &&
        (() => {
          const fx = base + shap.reduce((s, x) => s + x.value, 0);
          return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-bg/60 p-2">
                Base value E[f(x)]
                <b className="block text-sm text-white">{base.toFixed(2)}</b>
              </div>
              <div className="rounded-lg bg-bg/60 p-2">
                Output f(x), {space}
                <b className="block text-sm text-white">
                  {fx.toFixed(2)}
                  {space === "log-odds" && (
                    <span className="font-normal text-slate-400">
                      {" "}
                      (P malicious ≈ {Math.round(100 / (1 + Math.exp(-fx)))}%)
                    </span>
                  )}
                </b>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
