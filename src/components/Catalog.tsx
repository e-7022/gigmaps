"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { plural, type Dict } from "@/i18n/dict";
import { COUNTRY_SET } from "@/data/countries";
import { jobOverall, jobPlatform, jobs, type Category, type Job } from "@/data/jobs";
import { JobCard } from "./JobCard";
import { CountrySelect } from "./CountrySelect";

type Sort = "rec" | "pay" | "new";
interface State {
  q: string;
  cat: Category | "all";
  c: string;
  avail: boolean;
  nofluent: boolean;
  open: boolean;
  nodegree: boolean;
  sort: Sort;
}
const DEFAULT: State = { q: "", cat: "all", c: "", avail: false, nofluent: false, open: false, nodegree: false, sort: "rec" };
const CATS: Category[] = ["audio", "design", "language", "general"];
const STORE = "gigmap.country";

function fromParams(sp: URLSearchParams | null): State {
  if (!sp) return DEFAULT;
  const cat = sp.get("cat");
  const c = (sp.get("c") ?? "").toUpperCase();
  const sort = sp.get("sort");
  return {
    q: sp.get("q") ?? "",
    cat: cat && (CATS as string[]).includes(cat) ? (cat as Category) : "all",
    c: COUNTRY_SET.has(c) ? c : "",
    avail: sp.get("avail") === "1",
    nofluent: sp.get("nofluent") === "1",
    open: sp.get("open") === "1",
    nodegree: sp.get("nodegree") === "1",
    sort: sort === "pay" || sort === "new" ? sort : "rec",
  };
}

function toQuery(s: State) {
  const sp = new URLSearchParams();
  if (s.c) sp.set("c", s.c);
  if (s.cat !== "all") sp.set("cat", s.cat);
  if (s.q) sp.set("q", s.q);
  for (const k of ["avail", "nofluent", "open", "nodegree"] as const) if (s[k]) sp.set(k, "1");
  if (s.sort !== "rec") sp.set("sort", s.sort);
  const str = sp.toString();
  return `${window.location.pathname}${str ? `?${str}` : ""}${window.location.hash}`;
}

const OVERALL_RANK = { available: 0, maybe: 1, unavailable: 2 } as const;

function filterJobs(list: Job[], s: State) {
  const q = s.q.trim().toLowerCase();
  const out: Job[] = [];
  for (const j of list) {
    if (s.cat !== "all" && !j.categories.includes(s.cat)) continue;
    if (s.nofluent && j.english === "fluent") continue;
    if (s.open && !(j.status === "open" || j.status === "maybe")) continue;
    if (s.nodegree && j.degree) continue;
    if (s.c && s.avail && jobOverall(j, s.c) === "unavailable") continue;
    if (q) {
      const p = jobPlatform(j);
      const hay = `${j.title} ${p.name} ${p.owner ?? ""} ${j.language ?? ""} ${Object.values(j.note ?? {}).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(j);
  }
  const prio = (j: Job) => jobPlatform(j).priority + (j.status === "closed" ? 100 : 0);
  return out.toSorted((a, b) => {
    if (s.c) {
      const d = OVERALL_RANK[jobOverall(a, s.c)] - OVERALL_RANK[jobOverall(b, s.c)];
      if (d) return d;
    }
    if (s.sort === "pay") return (b.payMax ?? 0) - (a.payMax ?? 0);
    if (s.sort === "new") return (b.posted ?? "").localeCompare(a.posted ?? "");
    return prio(a) - prio(b);
  });
}

function View({ locale, d, state, set }: { locale: Locale; d: Dict; state: State; set: (p: Partial<State>) => void }) {
  const q = useDeferredValue(state.q);
  const items = useMemo(() => filterJobs(jobs, { ...state, q }), [state, q]);
  const dirty = JSON.stringify({ ...state, c: "" }) !== JSON.stringify(DEFAULT);

  return (
    <>
      <div className="filters" role="search">
        <div className="filters-top">
          <CountrySelect locale={locale} d={d} value={state.c} onChange={(c) => set({ c })} />
          <label className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="sr-only">{d.filters.search}</span>
            <input
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              placeholder={d.filters.placeholder}
              value={state.q}
              onChange={(e) => set({ q: e.target.value })}
            />
          </label>
        </div>

        {state.c ? null : <p className="small muted" style={{ margin: 0 }}>{d.country.hint}</p>}

        <div className="filter-row" role="group" aria-label={d.filters.direction}>
          <span className="filter-label">{d.filters.direction}</span>
          <button type="button" className="chip" aria-pressed={state.cat === "all"} onClick={() => set({ cat: "all" })}>
            {d.filters.all}
          </button>
          {CATS.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={state.cat === c} onClick={() => set({ cat: c })}>
              {d.cat[c]}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <label className="toggle" aria-disabled={!state.c}>
            <input type="checkbox" name="avail" disabled={!state.c} checked={state.avail && !!state.c} onChange={(e) => set({ avail: e.target.checked })} />
            {d.filters.available}
          </label>
          <label className="toggle">
            <input type="checkbox" name="open" checked={state.open} onChange={(e) => set({ open: e.target.checked })} />
            {d.filters.openOnly}
          </label>
          <label className="toggle">
            <input type="checkbox" name="nofluent" checked={state.nofluent} onChange={(e) => set({ nofluent: e.target.checked })} />
            {d.filters.noFluent}
          </label>
          <label className="toggle">
            <input type="checkbox" name="nodegree" checked={state.nodegree} onChange={(e) => set({ nodegree: e.target.checked })} />
            {d.filters.noDegree}
          </label>
        </div>
      </div>

      <div className="result-bar">
        <span className="muted small num" aria-live="polite">
          {items.length} {plural(locale, items.length, d.filters.jobs)}
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {dirty ? (
            <button type="button" className="chip" onClick={() => set({ ...DEFAULT, c: state.c })}>
              {d.filters.reset}
            </button>
          ) : null}
          <label className="small muted" htmlFor="sort">
            {d.filters.sort}
          </label>
          <select id="sort" name="sort" className="select" value={state.sort} onChange={(e) => set({ sort: e.target.value as Sort })}>
            <option value="rec">{d.filters.sortRec}</option>
            <option value="pay">{d.filters.sortPay}</option>
            <option value="new">{d.filters.sortNew}</option>
          </select>
        </span>
      </div>

      {items.length ? (
        <div className="grid">
          {items.map((j) => (
            <JobCard key={j.id} job={j} locale={locale} d={d} cc={state.c || undefined} inCatalog />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p style={{ margin: "0 0 12px" }}>{d.filters.empty}</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ ...DEFAULT, c: state.c })}>
            {d.filters.reset}
          </button>
        </div>
      )}
    </>
  );
}

export function StaticCatalog({ locale, d }: { locale: Locale; d: Dict }) {
  return <View locale={locale} d={d} state={DEFAULT} set={() => {}} />;
}

export function Catalog({ locale, d }: { locale: Locale; d: Dict }) {
  const sp = useSearchParams();
  const [state, setState] = useState<State>(() => fromParams(sp));

  // Восстанавливаем страну из прошлого визита, если её нет в ссылке
  useEffect(() => {
    if (state.c) return;
    try {
      const saved = localStorage.getItem(STORE);
      if (saved && COUNTRY_SET.has(saved)) {
        const next = { ...state, c: saved };
        setState(next);
        window.history.replaceState(null, "", toQuery(next));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<State>) => {
    const next = { ...state, ...patch };
    setState(next);
    window.history.replaceState(null, "", toQuery(next));
    if ("c" in patch) {
      try {
        if (patch.c) localStorage.setItem(STORE, patch.c);
        else localStorage.removeItem(STORE);
      } catch {}
    }
  };

  return <View locale={locale} d={d} state={state} set={set} />;
}
