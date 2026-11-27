import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as api from "./services/api.js";
const Ctx = createContext();
export const useStore = () => useContext(Ctx);
export function Provider({ children }) {
  const [min, setMin] = useState(false),
    [seen, setSeen] = useState(() => new Set()),
    [inv, setInv] = useState(() => new Set());
  const [alerts, setAlerts] = useState([]),
    [decisions, setDecisions] = useState([]),
    [health, setHealth] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, d, h] = await Promise.all([
        api.getAlerts(),
        api.getDecisions(),
        api.getHealth(),
      ]);
      setAlerts(a);
      setDecisions(d);
      setHealth(h);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const record = async (alert, body) => {
    const d = await api.postDecision(alert.id, {
      ...body,
      ts: new Date().toISOString(),
      snapshot: alert,
    });
    setDecisions((p) => [d, ...p]);
    return d;
  };
  return (
    <Ctx.Provider
      value={{
        min,
        setMin,
        unseen: alerts.filter((a) => !seen.has(a.id)).length,
        markSeen: (id) => setSeen((s) => new Set(s).add(id)),
        inv,
        startInv: (id) => setInv((s) => new Set(s).add(id)),
        alerts,
        decisions,
        health,
        loading,
        error,
        load,
        record,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
