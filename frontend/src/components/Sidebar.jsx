import { NavLink } from "react-router-dom";
import {
  Shield,
  Home,
  Crosshair,
  History,
  Menu,
  X,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../store.jsx";
const L = [
  ["/", Home, "Home"],
  ["/workspace", Crosshair, "Supervisor Workspace"],
  ["/history", History, "Decision History"],
];
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { min, setMin, unseen } = useStore();
  return (
    <>
      <button
        aria-label="Open menu"
        className="fixed left-3 top-3 z-40 rounded-xl border border-line bg-panel p-2.5 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-[#080f1d] transition-all lg:z-30 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${min ? "lg:w-[72px]" : "lg:w-64"}`}
      >
        <div className="flex items-center gap-3 p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cy/15 text-cy ring-1 ring-cy/40">
            <Shield size={18} />
          </span>
          {!min && (
            <span className="font-display text-lg font-bold text-white">
              AEGIS AI
            </span>
          )}
          <button
            aria-label="Close menu"
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {L.map(([to, I, t]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={t}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-cy/10 text-white before:absolute before:-left-3 before:h-6 before:w-1 before:rounded-r before:bg-cy" : "text-slate-400 hover:bg-line/50 hover:text-white"}`
              }
            >
              <I size={18} className="shrink-0" />
              {!min && t}
              {to === "/workspace" && unseen > 0 && (
                <span
                  title={`${unseen} unreviewed alerts`}
                  className="ml-auto rounded-full bg-bad px-1.5 text-xs font-medium text-white"
                >
                  {unseen}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3 border-t border-line p-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-slate-500" />
            {!min && "System status: unverified (mock)"}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <UserCircle className="shrink-0" />
            {!min && "Administrator"}
          </div>
          <button
            onClick={() => setMin(!min)}
            className="hidden items-center gap-2 text-slate-500 hover:text-white lg:flex"
          >
            {min ? (
              <PanelLeftOpen size={16} />
            ) : (
              <>
                <PanelLeftClose size={16} />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
