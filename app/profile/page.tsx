"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ──────────────────────────────────────────────────────────────────────
type LocationResult = {
  id: string; name: string; latitude: string; longitude: string;
  country: string; countryCode: string; state: string;
  city: string; district: string; type: string;
};

type PersonRecord = {
  id: string; label?: string;
  birthDate: string; birthTime: string; birthTimeUnknown: boolean;
  location?: (LocationResult | { name?: string; city?: string }) | null;
  locationQuery?: string; birthPlaceDetail?: string;
  gender: string;
  education?: string; careerStatus?: string; relationshipStatus?: string;
  romanceHistory?: string; familySupport?: string; lifeEvents?: string[];
};

type FormState = {
  label: string; birthDate: string; birthTime: string; birthTimeUnknown: boolean;
  gender: "male" | "female" | "other" | "";
  education: string; careerStatus: string; relationStatus: string;
  romance: string; family: string; lifeEvents: string[];
};

// ─── Constants ──────────────────────────────────────────────────────────────────
const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
const STEMS  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRNCH  = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

const ELEM_COLORS: Record<string, { from: string; to: string; fg: string }> = {
  木: { from: "#5a7a3c", to: "#3a5228", fg: "#eef5e5" },
  火: { from: "#b84033", to: "#7a2820", fg: "#fdf0ee" },
  土: { from: "#917234", to: "#5e491e", fg: "#fffaf0" },
  金: { from: "#b8914a", to: "#7a5e28", fg: "#fffaf0" },
  水: { from: "#2e6080", to: "#1a3a52", fg: "#eef4f8" },
};

const EDUCATION_OPTIONS = ["高中/中专","本科","硕士","博士","在读","其他"];
const CAREER_OPTIONS    = ["学生","求职中","在职","管理层","自由职业","创业中","待业","其他"];
const RELATION_OPTIONS  = ["单身","暧昧中","恋爱中","已婚","离异","分居","不便透露"];
const ROMANCE_OPTIONS   = ["无正式恋爱经历","1段","2-3段","4段及以上","不便透露"];
const FAMILY_OPTIONS    = ["支持较多","支持一般","主要靠自己","有经济压力","不便透露"];
const LIFE_OPTIONS      = [
  "换专业/转行","长期异地","出国/留学","创业经历",
  "重大考试","家庭变故","重要分手","失业","大额投资亏损","无明显重大事件",
];

const EMPTY_FORM: FormState = {
  label:"", birthDate:"", birthTime:"12:00", birthTimeUnknown:false,
  gender:"", education:"", careerStatus:"", relationStatus:"",
  romance:"", family:"", lifeEvents:[],
};

// ─── Pure helpers ────────────────────────────────────────────────────────────────
function getZodiac(d: string) {
  const y = +d.split("-")[0]; return isNaN(y) ? "？" : ZODIAC[(y-1900+1200)%12];
}
function getElement(d: string) {
  const y = +d.split("-")[0];
  return isNaN(y) ? "土" : ["木","木","火","火","土","土","金","金","水","水"][(y-4+1200)%10];
}
function getGanZhi(d: string) {
  const y = +d.split("-")[0];
  return isNaN(y) ? "" : `${STEMS[(y-4+1200)%10]}${BRNCH[(y-4+1200)%12]}年`;
}
function getAge(d: string): number | null {
  if (!d) return null;
  const b = new Date(d); if (isNaN(b.getTime())) return null;
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a < 0 ? null : a;
}
function gLabel(g: string) { return {male:"男",female:"女",other:"其他"}[g] ?? "未知"; }
function cityOf(p: PersonRecord) {
  const l = p.location as Record<string,string>|null|undefined;
  return l?.city || l?.name || "";
}
function score(p: PersonRecord) {
  const fs = [p.education, p.careerStatus, p.relationshipStatus, p.romanceHistory, p.familySupport, (p.lifeEvents?.length ?? 0) > 0];
  return Math.round(fs.filter(Boolean).length / fs.length * 100);
}
function genId()  { return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`; }
function load()   { try { return JSON.parse(localStorage.getItem("bazi:persons")??"[]") as PersonRecord[]; } catch { return []; } }
function persist(ps: PersonRecord[]) { localStorage.setItem("bazi:persons", JSON.stringify(ps)); }
function getSel() { return localStorage.getItem("chronora:selectedPersonId"); }
function setSel(id: string) { localStorage.setItem("chronora:selectedPersonId", id); }

// ─── Avatar ──────────────────────────────────────────────────────────────────────
function Avatar({ date, size=64 }: { date: string; size?: number }) {
  const e = getElement(date); const c = ELEM_COLORS[e] ?? ELEM_COLORS["土"];
  return (
    <div className="grid shrink-0 place-items-center rounded-full font-zh-title font-bold"
      style={{
        width:size, height:size,
        background:`linear-gradient(145deg,${c.from},${c.to})`,
        color:c.fg, fontSize:size*0.38,
        boxShadow:`0 4px 18px ${c.from}55,inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >{getZodiac(date)}</div>
  );
}

// ─── Custom sticky nav ───────────────────────────────────────────────────────────
function ProfileNav({ showQuickNew, onNew, selectedId }: {
  showQuickNew: boolean; onNew: () => void; selectedId: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="sticky top-3 z-50">
      <nav className={`flex items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 backdrop-blur-xl transition-all duration-500 sm:px-4 ${
        scrolled
          ? "border border-[rgba(201,168,93,0.28)] bg-white/90 shadow-[0_8px_36px_rgba(23,32,29,0.14),0_0_0_1px_rgba(201,168,93,0.07),inset_0_1px_0_rgba(255,255,255,0.72)]"
          : "border border-white/65 bg-white/75 shadow-[0_4px_18px_rgba(23,32,29,0.08),inset_0_1px_0_rgba(255,255,255,0.55)]"
      }`}>

        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" aria-label="返回首页" className="group shrink-0">
            <Image src="/logo.png" alt="" width={40} height={40}
              className="h-9 w-9 rounded-[9px] shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10"
              priority
            />
          </Link>

          {/* vertical divider */}
          <div className="hidden h-5 w-px shrink-0 bg-ink/14 sm:block" />

          {/* Breadcrumb */}
          <ol className="hidden items-center gap-1.5 sm:flex" aria-label="导航路径">
            <li>
              <Link href="/" className="text-sm text-moss/58 transition-colors duration-200 hover:text-jade">首页</Link>
            </li>
            <li aria-hidden>
              <svg className="h-3 w-3 text-ink/22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-ink">命主档案</span>
              {/* active indicator — gold pulse */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-55" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
            </li>
          </ol>
        </div>

        {/* Right: dynamic action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          {/* "+ 新建" slides in when header btn scrolls out of view */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{ maxWidth: showQuickNew ? "7rem" : "0", opacity: showQuickNew ? 1 : 0 }}
          >
            <button
              onClick={onNew}
              className="whitespace-nowrap rounded-xl bg-gradient-to-br from-[#c9a85d] to-[#9a742e] px-3.5 py-1.5 text-xs font-bold text-[#18140a] shadow-sm transition hover:brightness-110"
            >
              + 新建
            </button>
          </div>

          {selectedId ? (
            <>
              <Link href="/bazi" onClick={() => setSel(selectedId)}
                className="hidden whitespace-nowrap rounded-xl border border-ink/15 bg-white/65 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-jade/35 hover:text-jade sm:block">
                八字
              </Link>
              <Link href="/ziwei" onClick={() => setSel(selectedId)}
                className="whitespace-nowrap rounded-xl bg-ink/82 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-jade">
                紫微
              </Link>
            </>
          ) : (
            <Link href="/"
              className="whitespace-nowrap rounded-xl border border-ink/15 bg-white/65 px-3 py-1.5 text-xs font-medium text-ink transition hover:text-jade">
              首页
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

// ─── PersonCard ──────────────────────────────────────────────────────────────────
function PersonCard({
  person, isSelected, isEditing, isPendingDelete,
  onSelect, onEdit, onDelete, onConfirmDelete, onCancelDelete,
}: {
  person: PersonRecord; isSelected: boolean; isEditing: boolean; isPendingDelete: boolean;
  onSelect: () => void; onEdit: () => void; onDelete: () => void;
  onConfirmDelete: () => void; onCancelDelete: () => void;
}) {
  const sc = score(person);
  const city = cityOf(person);
  const label = person.label || `${person.birthDate.split("-")[0]}·${gLabel(person.gender)}`;
  const age = getAge(person.birthDate);
  const ganzhi = getGanZhi(person.birthDate);
  const barColor = sc >= 80 ? "bg-jade" : sc >= 50 ? "bg-gold" : "bg-ember/65";

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white/84 backdrop-blur-sm transition-all duration-200 ${
      isSelected
        ? "border-[rgba(201,168,93,0.52)] shadow-[0_0_0_4px_rgba(201,168,93,0.10),0_16px_42px_rgba(86,62,30,0.12)]"
        : isEditing
        ? "border-jade/42 shadow-[0_0_0_3px_rgba(111,127,79,0.09),0_8px_24px_rgba(39,54,47,0.08)]"
        : "border-ink/10 shadow-md hover:border-ink/18 hover:shadow-lg"
    }`}>

      {/* Selected strip — stays inside overflow-hidden */}
      {isSelected && (
        <div className="flex items-center gap-2 border-b border-gold/18 bg-gradient-to-r from-gold/12 via-gold/7 to-transparent px-4 py-2">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.1em] text-gold-dark">当前使用</span>
        </div>
      )}

      <div className="flex gap-4 p-5">
        <Avatar date={person.birthDate} size={68} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold leading-tight text-ink">{label}</p>
          <p className="mt-1 text-sm text-moss">{person.birthDate}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {ganzhi && <span className="rounded-md bg-gold/12 px-2 py-0.5 text-[11px] font-semibold text-gold-dark">{ganzhi}</span>}
            <span className="rounded-md bg-ink/7 px-2 py-0.5 text-[11px] text-moss">
              {gLabel(person.gender)}{age !== null ? ` · ${age}岁` : ""}
            </span>
            {city && <span className="rounded-md bg-ink/7 px-2 py-0.5 text-[11px] text-moss">{city}</span>}
          </div>
          {(person.education || person.careerStatus) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[person.education, person.careerStatus].filter(Boolean).map((t) => (
                <span key={t} className="rounded bg-jade/10 px-2 py-0.5 text-[11px] font-medium text-jade">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion bar */}
      <div className="mx-5 mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-moss/55">档案完整度</span>
          <span className="text-[11px] font-semibold text-moss">{sc}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${sc}%` }} />
        </div>
      </div>

      {/* Action row */}
      {isPendingDelete ? (
        <div className="flex items-center justify-between border-t border-ink/8 bg-ember/4 px-4 py-3">
          <span className="text-sm font-medium text-ember">确认删除此档案？</span>
          <div className="flex gap-2">
            <button onClick={onCancelDelete} className="rounded-lg border border-ink/15 bg-white/80 px-3 py-1.5 text-xs text-moss transition hover:bg-white">取消</button>
            <button onClick={onConfirmDelete} className="rounded-lg bg-ember/15 px-3 py-1.5 text-xs font-bold text-ember transition hover:bg-ember/25">删除</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-ink/8 bg-paper/30 px-4 py-3">
          <div className="flex gap-1.5">
            <button onClick={onEdit}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${isEditing ? "border-jade/45 bg-jade/10 text-jade" : "border-ink/15 bg-paper/60 text-moss hover:border-jade/35 hover:text-jade"}`}>
              {isEditing ? "编辑中" : "编辑"}
            </button>
            <button onClick={onDelete} className="rounded-lg border border-transparent px-3 py-1.5 text-xs text-moss/42 transition hover:border-ember/20 hover:bg-ember/8 hover:text-ember">
              删除
            </button>
          </div>
          {isSelected ? (
            <div className="flex gap-2">
              <Link href="/bazi" onClick={() => setSel(person.id)} className="rounded-lg border border-gold/50 bg-gold/18 px-3 py-1.5 text-xs font-semibold text-gold-dark transition hover:bg-gold/28">八字</Link>
              <Link href="/ziwei" onClick={() => setSel(person.id)} className="rounded-lg bg-jade px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-90">紫微</Link>
            </div>
          ) : (
            <button onClick={onSelect} className="rounded-lg bg-ink/78 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-jade">设为当前</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form helpers ────────────────────────────────────────────────────────────────
function Chip({ sel, onClick, children }: { sel: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${sel ? "border-jade/55 bg-jade/12 text-jade shadow-sm" : "border-ink/12 bg-paper/65 text-moss hover:border-jade/35 hover:bg-paper/85"}`}>
      {children}
    </button>
  );
}

function FSec({ accent, title, note, children }: { accent: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className={`h-5 w-1 rounded-full ${accent}`} />
        <p className="text-base font-semibold text-ink">{title}</p>
        {note && <span className="text-xs text-moss/52">{note}</span>}
      </div>
      {children}
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [persons, setPersons]           = useState<PersonRecord[]>([]);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [editingId, setEditingId]       = useState<string | "new" | null>(null);
  const [pendingDeleteId, setPDId]      = useState<string | null>(null);
  const [saveOk, setSaveOk]             = useState(false);
  const [showQuickNew, setShowQuickNew] = useState(false);

  // Location search
  const [locQuery, setLocQuery]       = useState("");
  const [locResults, setLocResults]   = useState<LocationResult[]>([]);
  const [selLoc, setSelLoc]           = useState<LocationResult | null>(null);
  const [locSearching, setLocSrch]    = useState(false);
  const [locErr, setLocErr]           = useState("");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Ref for the header "+ 新建档案" button → drives showQuickNew
  const headerBtnRef = useRef<HTMLButtonElement>(null);
  // Ref to scroll to form
  const formRef = useRef<HTMLDivElement>(null);

  const showForm = editingId !== null;

  useEffect(() => {
    const ps = load();
    setPersons(ps);
    const sid = getSel() ?? ps[0]?.id ?? null;
    setSelectedId(sid);
  }, []);

  // IntersectionObserver: show compact nav btn when header btn leaves viewport
  useEffect(() => {
    const el = headerBtnRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowQuickNew(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function upd(p: Partial<FormState>) { setForm((prev) => ({ ...prev, ...p })); }

  function resetLoc() { setLocQuery(""); setLocResults([]); setSelLoc(null); setLocErr(""); }

  function openCreate() {
    setEditingId("new"); setForm(EMPTY_FORM); resetLoc();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function openEdit(p: PersonRecord) {
    if (editingId === p.id) { setEditingId(null); return; }
    setEditingId(p.id);
    setForm({
      label: p.label ?? "", birthDate: p.birthDate,
      birthTime: p.birthTime || "12:00", birthTimeUnknown: p.birthTimeUnknown,
      gender: (p.gender as FormState["gender"]) || "",
      education: p.education ?? "", careerStatus: p.careerStatus ?? "",
      relationStatus: p.relationshipStatus ?? "", romance: p.romanceHistory ?? "",
      family: p.familySupport ?? "", lifeEvents: p.lifeEvents?.filter(Boolean) ?? [],
    });
    const loc = p.location as (LocationResult & { latitude?: string }) | null | undefined;
    if (loc?.latitude) { setSelLoc(loc as LocationResult); setLocQuery(p.locationQuery ?? loc.name ?? ""); }
    else if (loc) { setSelLoc(null); setLocQuery((loc as { city?: string; name?: string }).city ?? (loc as { city?: string; name?: string }).name ?? ""); }
    else resetLoc();
    setLocResults([]); setLocErr("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  async function searchLoc() {
    const q = locQuery.trim(); if (q.length < 2) { setLocErr("请输入至少 2 个字再搜索。"); return; }
    setLocSrch(true); setLocErr("");
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "搜索失败");
      setLocResults(data.results ?? []);
      if (!data.results?.length) setLocErr("未找到匹配地点，请换个关键词。");
    } catch (e) { setLocErr(e instanceof Error ? e.message : "搜索失败，请重试。"); }
    finally { setLocSrch(false); }
  }

  function toggleEvent(v: string) {
    setForm((prev) => {
      const vs = prev.lifeEvents;
      if (vs.includes(v)) return { ...prev, lifeEvents: vs.filter((x) => x !== v) };
      if (v === "无明显重大事件") return { ...prev, lifeEvents: [v] };
      return { ...prev, lifeEvents: [...vs.filter((x) => x !== "无明显重大事件"), v].slice(0, 4) };
    });
  }

  function handleSave() {
    if (!form.birthDate || !form.gender) return;
    const id = editingId === "new" ? genId() : (editingId as string);
    const existing = persons.find((p) => p.id === id);
    const rec: PersonRecord = {
      ...(existing ?? {}), id,
      label: form.label.trim() || undefined,
      birthDate: form.birthDate,
      birthTime: form.birthTimeUnknown ? "" : form.birthTime,
      birthTimeUnknown: form.birthTimeUnknown,
      location: selLoc ?? existing?.location ?? null,
      locationQuery: locQuery.trim() || existing?.locationQuery,
      gender: form.gender,
      education: form.education || undefined,
      careerStatus: form.careerStatus || undefined,
      relationshipStatus: form.relationStatus || undefined,
      romanceHistory: form.romance || undefined,
      familySupport: form.family || undefined,
      lifeEvents: form.lifeEvents.filter(Boolean),
    };
    const next = editingId === "new" ? [rec, ...persons] : persons.map((p) => p.id === id ? rec : p);
    persist(next); setPersons(next);
    if (!selectedId || editingId === "new") { setSelectedId(rec.id); setSel(rec.id); }
    setEditingId(null); setSaveOk(true); setTimeout(() => setSaveOk(false), 3200);
  }

  function handleSelect(id: string) { setSelectedId(id); setSel(id); }

  function handleDelete(id: string) {
    const next = persons.filter((p) => p.id !== id);
    persist(next); setPersons(next); setPDId(null);
    if (selectedId === id) { const n = next[0]?.id ?? null; setSelectedId(n); if (n) setSel(n); }
    if (editingId === id) setEditingId(null);
  }

  const inputCls = "mt-2 w-full rounded-xl border border-gold/22 bg-[rgba(255,252,245,0.97)] px-4 py-3 text-ink shadow-sm outline-none transition placeholder:text-moss/45 focus:border-gold focus:ring-2 focus:ring-gold/14";

  return (
    <main className="min-h-screen px-5 py-5 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">

        {/* ── Custom nav ─────────────────────────────────────────────────── */}
        <ProfileNav
          showQuickNew={showQuickNew}
          onNew={openCreate}
          selectedId={selectedId}
        />

        {/* ── Page header (light, matching Bazi/Ziwei style) ─────────────── */}
        <section className="pb-8 pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-jade opacity-0 animate-ink-reveal">
                命主档案 · 跨模块共享
              </p>
              <h1
                className="mt-3 text-4xl font-semibold text-ink opacity-0 animate-ink-reveal sm:text-5xl"
                style={{ animationDelay: "80ms" }}
              >
                基础资料管理
              </h1>
              <p
                className="mt-3 max-w-lg text-base leading-7 text-moss opacity-0 animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                统一录入出生信息，一份档案同时用于八字、紫微斗数各模块解读。
              </p>

              {persons.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 opacity-0 animate-fade-up" style={{ animationDelay: "280ms" }}>
                  <span className="rounded-full border border-jade/22 bg-jade/7 px-4 py-1.5 text-xs font-semibold text-jade">
                    {persons.length} 份档案
                  </span>
                  <span className="rounded-full border border-ink/12 bg-paper/70 px-4 py-1.5 text-xs text-moss">
                    八字 · 紫微共享
                  </span>
                </div>
              )}
            </div>

            {/* Header "+ 新建档案" button — observed by IntersectionObserver */}
            <button
              ref={headerBtnRef}
              onClick={openCreate}
              className="shrink-0 self-start rounded-2xl bg-gradient-to-br from-[#c9a85d] to-[#9a742e] px-7 py-3.5 text-sm font-bold text-[#18140a] shadow-[0_8px_24px_rgba(138,106,53,0.28)] transition hover:brightness-110 active:scale-[0.97] opacity-0 animate-fade-up sm:self-auto"
              style={{ animationDelay: "300ms" }}
            >
              + 新建档案
            </button>
          </div>
        </section>

        {/* ── Success toast ──────────────────────────────────────────────── */}
        {saveOk && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-jade/28 bg-jade/9 px-4 py-3.5 text-sm font-semibold text-jade shadow-sm">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            档案已保存
          </div>
        )}

        {/* ── Cards or empty state ───────────────────────────────────────── */}
        {persons.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/45 px-8 py-20 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-ink/18 font-zh-title text-4xl text-ink/22">命</div>
            <p className="mt-6 text-lg font-semibold text-ink">还没有保存的档案</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-moss">
              新建一份档案后，出生资料会在八字、紫微斗数等模块中自动复用，无需重复填写。
            </p>
            <button
              onClick={openCreate}
              className="mt-7 rounded-2xl bg-gradient-to-br from-[#c9a85d] to-[#9a742e] px-10 py-3 text-sm font-bold text-[#18140a] shadow-md transition hover:brightness-110"
            >
              新建第一份档案
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {persons.map((p, i) => (
              <div key={p.id} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                <PersonCard
                  person={p}
                  isSelected={selectedId === p.id}
                  isEditing={editingId === p.id}
                  isPendingDelete={pendingDeleteId === p.id}
                  onSelect={() => handleSelect(p.id)}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setPDId(p.id)}
                  onConfirmDelete={() => handleDelete(p.id)}
                  onCancelDelete={() => setPDId(null)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Edit / Create form ─────────────────────────────────────────── */}
        {showForm && (
          <div ref={formRef} className="mt-7 overflow-hidden rounded-2xl border border-ink/12 bg-white/92 shadow-[0_28px_72px_rgba(39,54,47,0.12)] backdrop-blur-sm">
            {/* Form header */}
            <div className="flex items-center justify-between border-b border-ink/10 bg-gradient-to-r from-[#fffbf2] to-white px-6 py-5 md:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-jade">
                  {editingId === "new" ? "新建档案" : "编辑档案"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-ink">填写基础资料</h2>
              </div>
              <button
                onClick={() => setEditingId(null)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink/12 text-moss/50 transition hover:border-ink/20 hover:bg-ink/4 hover:text-ink"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-10 p-6 md:p-8">

              {/* 1. 基本身份 */}
              <FSec accent="bg-gradient-to-b from-gold to-gold/35" title="基本身份">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block text-sm font-medium text-ink/80">
                    档案名称<span className="ml-1 text-xs font-normal text-moss/55">（选填）</span>
                    <input type="text" value={form.label} onChange={(e) => upd({ label: e.target.value })}
                      placeholder="如：本人、妈妈、朋友小李" className={inputCls} />
                    <span className="mt-1.5 block text-xs text-moss/52">不填则显示为出生年份 · 性别</span>
                  </label>
                  <div>
                    <p className="text-sm font-medium text-ink/80">性别 <span className="text-ember">*</span></p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(["male","female","other"] as const).map((g) => (
                        <button key={g} type="button" onClick={() => upd({ gender: g })}
                          className={`rounded-xl border py-3 text-sm font-semibold transition ${form.gender === g ? "border-gold/55 bg-gold/12 text-gold-dark shadow-sm" : "border-ink/12 bg-paper/65 text-moss hover:border-gold/30 hover:bg-paper/85"}`}>
                          {g === "male" ? "男" : g === "female" ? "女" : "其他"}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-moss/52">紫微斗数大运方向由性别决定。</p>
                  </div>
                </div>
              </FSec>

              {/* 2. 出生时间 */}
              <FSec accent="bg-gradient-to-b from-jade to-jade/35" title="出生时间">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block text-sm font-medium text-ink/80">
                    出生日期（阳历）<span className="ml-1 text-ember">*</span>
                    <input type="date" value={form.birthDate} onChange={(e) => upd({ birthDate: e.target.value })}
                      max={new Date().toISOString().split("T")[0]} className={inputCls} />
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-ink/80">
                      出生时间
                      <input type="time" value={form.birthTime} onChange={(e) => upd({ birthTime: e.target.value })}
                        disabled={form.birthTimeUnknown} className={`${inputCls} disabled:opacity-40`} />
                    </label>
                    <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-ink/10 bg-paper/55 px-4 py-2.5 text-sm text-moss">
                      <input type="checkbox" checked={form.birthTimeUnknown} onChange={(e) => upd({ birthTimeUnknown: e.target.checked })} className="h-4 w-4 accent-jade" />
                      时辰不详
                    </label>
                  </div>
                </div>
              </FSec>

              {/* 3. 出生地 */}
              <FSec accent="bg-gradient-to-b from-ember/75 to-ember/28" title="出生地点" note="八字排盘需精确坐标，在此选定后可直接使用">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input value={locQuery}
                    onChange={(e) => { setLocQuery(e.target.value); setSelLoc(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchLoc(); } }}
                    placeholder="搜索出生城市、区县或英文地址"
                    className="min-w-0 flex-1 rounded-xl border border-gold/22 bg-[rgba(255,252,245,0.97)] px-4 py-3 text-ink shadow-sm outline-none transition placeholder:text-moss/45 focus:border-gold focus:ring-2 focus:ring-gold/14"
                  />
                  <button type="button" onClick={searchLoc} disabled={locSearching}
                    className="shrink-0 rounded-xl border border-gold/30 bg-paper/80 px-7 py-3 text-sm font-semibold text-gold-dark shadow-sm transition hover:bg-paper disabled:opacity-55">
                    {locSearching ? "搜索中…" : "搜索"}
                  </button>
                </div>
                {selLoc && locResults.length === 0 && <p className="mt-2 text-xs font-semibold text-jade">已选：{selLoc.name}</p>}
                {locErr && <p className="mt-2 rounded-xl border border-ember/20 bg-ember/7 px-3 py-2.5 text-sm text-ember">{locErr}</p>}
                {locResults.length > 0 && (
                  <div className="mt-3 space-y-1 rounded-xl border border-ink/10 bg-paper/70 p-2 shadow-sm">
                    {locResults.map((r) => (
                      <button key={r.id} type="button"
                        onClick={() => { setSelLoc(r); setLocQuery(r.name); setLocResults([]); setLocErr(""); }}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${selLoc?.id === r.id ? "border-jade/40 bg-jade/8 text-ink" : "border-transparent text-moss hover:border-jade/30 hover:bg-white/75"}`}>
                        <span className="block font-semibold text-ink">{r.name}</span>
                        <span className="text-xs text-moss/55">{r.country}{r.state ? ` · ${r.state}` : ""}</span>
                      </button>
                    ))}
                  </div>
                )}
              </FSec>

              {/* 4. 个人状态 */}
              <FSec accent="bg-gradient-to-b from-moss to-moss/28" title="个人状态" note="选填，帮助 AI 给出更贴切的解读">
                <div className="space-y-6">
                  {([
                    { label:"学历 / 学习", key:"education" as const,    opts:EDUCATION_OPTIONS },
                    { label:"事业状态",   key:"careerStatus" as const,  opts:CAREER_OPTIONS    },
                    { label:"感情状态",   key:"relationStatus" as const, opts:RELATION_OPTIONS  },
                    { label:"恋爱经历",   key:"romance" as const,        opts:ROMANCE_OPTIONS   },
                    { label:"家庭支持",   key:"family" as const,         opts:FAMILY_OPTIONS    },
                  ] as const).map(({ label, key, opts }) => (
                    <div key={key}>
                      <p className="mb-2.5 text-sm font-medium text-ink/80">{label}</p>
                      <div className="flex flex-wrap gap-2">
                        {opts.map((opt) => (
                          <Chip key={opt} sel={form[key] === opt} onClick={() => upd({ [key]: form[key] === opt ? "" : opt })}>{opt}</Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </FSec>

              {/* 5. 重要经历 */}
              <FSec accent="bg-gradient-to-b from-[#c9a85d]/80 to-[#c9a85d]/22" title="重要人生经历" note="可多选，最多 4 项">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {LIFE_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => toggleEvent(opt)}
                      className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${form.lifeEvents.includes(opt) ? "border-jade/52 bg-jade/11 text-jade shadow-sm" : "border-ink/12 bg-paper/65 text-moss hover:border-jade/32 hover:bg-paper/85"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </FSec>
            </div>

            {/* Form footer */}
            <div className="flex flex-col gap-3 border-t border-ink/10 bg-gradient-to-r from-[#fffbf2]/80 to-white/85 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <p className="text-sm">
                {!form.birthDate || !form.gender
                  ? <span className="text-ember/75">请至少填写出生日期和性别</span>
                  : <span className="font-medium text-jade/80">{form.birthDate} · {gLabel(form.gender)}{form.label ? ` · ${form.label}` : ""}</span>
                }
              </p>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => setEditingId(null)}
                  className="rounded-xl border border-ink/15 bg-paper/80 px-5 py-2.5 text-sm font-medium text-moss transition hover:bg-white">
                  取消
                </button>
                <button type="button" onClick={handleSave} disabled={!form.birthDate || !form.gender}
                  className="rounded-xl bg-gradient-to-br from-[#c9a85d] to-[#9a742e] px-8 py-2.5 text-sm font-bold text-[#18140a] shadow-[0_6px_20px_rgba(138,106,53,0.28)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                  保存档案
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer links ────────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-ink/8 pt-6 pb-4">
          <Link href="/" className="text-sm text-moss/52 underline underline-offset-4 transition hover:text-jade">← 返回首页</Link>
          {selectedId && (
            <>
              <Link href="/bazi" onClick={() => setSel(selectedId)} className="text-sm text-moss/52 underline underline-offset-4 transition hover:text-gold-dark">前往八字排盘</Link>
              <Link href="/ziwei" onClick={() => setSel(selectedId)} className="text-sm text-moss/52 underline underline-offset-4 transition hover:text-jade">前往紫微排盘</Link>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
