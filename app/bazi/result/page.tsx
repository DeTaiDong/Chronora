"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BaziChart, ChartColumn } from "@/app/bazi/chartEngine";
import { hasSecondaryInfo } from "@/lib/fortune-master";
import SiteNav from "@/components/SiteNav";
import ShenShaTag from "@/components/ShenShaTag";

// ── 五行颜色 ──────────────────────────────────────────────────
const elementColors: Record<string, string> = {
  木: "text-emerald-600", 火: "text-red-500", 土: "text-yellow-700",
  金: "text-zinc-400",   水: "text-blue-500",
};
const elementColorsDark: Record<string, string> = {
  木: "text-emerald-400", 火: "text-red-400", 土: "text-yellow-300",
  金: "text-zinc-300",   水: "text-blue-400",
};
const elementBarColors: Record<string, string> = {
  木: "bg-emerald-500", 火: "bg-red-500", 土: "bg-yellow-600",
  金: "bg-zinc-400",   水: "bg-blue-500",
};

// ── 神煞分类 ──────────────────────────────────────────────────
const auspiciousStars = new Set([
  "天乙贵人","太极贵人","文昌贵人","天厨贵人","国印贵人",
  "金舆","红鸾","天喜","将星","月德","德秀贵人","天医",
]);
const inauspiciousStars = new Set([
  "血刃","飞刃","亡神","劫煞","灾煞","九丑日","阴差阳错","童子煞",
]);
function starTagClass(star: string) {
  if (auspiciousStars.has(star)) return "border border-jade/30 bg-jade/10 text-jade";
  if (inauspiciousStars.has(star)) return "border border-ember/30 bg-ember/10 text-ember";
  return "border border-ink/15 bg-ink/5 text-moss";
}

// ── 工具 ─────────────────────────────────────────────────────
function genderLabel(v?: string) {
  return { female: "女", male: "男", other: "其他 / 不便分类" }[v ?? ""] ?? v;
}

// ── IntersectionObserver reveal hook ─────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

// ── 藏干列表 ─────────────────────────────────────────────────
function HiddenStemList({ column }: { column: ChartColumn }) {
  return (
    <div className="space-y-1.5">
      {column.hiddenStems.map((item) => (
        <div key={`${column.label}-${item.stem}`} className="flex items-center gap-2 text-sm">
          <span className={`font-semibold ${elementColors[item.element]}`}>
            {item.stem} {item.element}
          </span>
          <span className="text-moss/70">{item.tenGod}</span>
        </div>
      ))}
    </div>
  );
}

// ── 桌面端表（合并天干+地支为一行，text-4xl） ─────────────────
const rowLabels = ["主星", "干支", "藏干 / 副星", "星运", "空亡", "纳音"] as const;

function renderCell(row: (typeof rowLabels)[number], col: ChartColumn) {
  switch (row) {
    case "主星":
      return <span className="text-base font-semibold text-ink">{col.mainStar}</span>;
    case "干支":
      return (
        <div className="flex flex-col items-center gap-2 py-0.5">
          <span className={`text-4xl font-semibold leading-none ${elementColors[col.heavenlyStem.element]}`}>
            {col.heavenlyStem.value}
            <span className="ml-1 text-sm opacity-40">{col.heavenlyStem.emoji}</span>
          </span>
          <span className={`text-4xl font-semibold leading-none ${elementColors[col.earthlyBranch.element]}`}>
            {col.earthlyBranch.value}
            <span className="ml-1 text-sm opacity-40">{col.earthlyBranch.emoji}</span>
          </span>
        </div>
      );
    case "藏干 / 副星": return <HiddenStemList column={col} />;
    case "星运":  return <span className="text-base text-ink">{col.lifeStage}</span>;
    case "空亡":  return <span className="text-base text-ink">{col.voidBranches}</span>;
    case "纳音":  return <span className="text-base text-ink">{col.nayin}</span>;
  }
}

// ── Mobile 柱卡片（stagger delay） ──────────────────────────────
function PillarCard({ column, delay }: { column: ChartColumn; delay: number }) {
  return (
    <article
      className="opacity-0 animate-fade-up rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">{column.label}</p>
          <p className="mt-2 text-xl font-semibold text-ink">{column.mainStar}</p>
        </div>
        <div className="flex gap-5">
          {([
            { label: "天干", s: column.heavenlyStem },
            { label: "地支", s: column.earthlyBranch },
          ] as const).map(({ label, s }) => (
            <div key={label} className="text-center">
              <p className="mb-1.5 text-xs text-moss">{label}</p>
              <p className={`text-4xl font-semibold leading-none ${elementColors[s.element]}`}>{s.value}</p>
              <p className="mt-1 text-base opacity-40">{s.emoji}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-ink/10 pt-4">
        <p className="mb-2 text-xs font-medium text-moss">藏干 / 副星</p>
        <HiddenStemList column={column} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
        {[
          { label: "星运", value: column.lifeStage },
          { label: "空亡", value: column.voidBranches },
          { label: "纳音", value: column.nayin },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-moss">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

// ── 五行分布卡片（reveal + 动画进度条） ──────────────────────────
function FiveElementsCard({
  fiveElements, maxElement, strongestElement, weakestElement,
}: {
  fiveElements: Record<string, number>;
  maxElement: number;
  strongestElement: string;
  weakestElement: string;
}) {
  const [ref, visible] = useReveal();
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-ember">五行</p>
      <h2 className="mt-1 text-xl font-semibold text-ink">五行分布</h2>
      <div className="mt-5 space-y-3.5">
        {Object.entries(fiveElements).map(([el, val], i) => (
          <div key={el} className="flex items-center gap-3">
            <span className={`w-5 shrink-0 text-sm font-semibold ${elementColors[el]}`}>{el}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div
                className={`h-full rounded-full ${elementBarColors[el] ?? "bg-jade"}`}
                style={{
                  width: animated ? `${(val / maxElement) * 100}%` : "0%",
                  transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-sm font-medium text-moss">{val}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-moss">
        最显：<span className={`font-semibold ${elementColors[strongestElement]}`}>{strongestElement}</span>
        {" · "}
        较弱：<span className={`font-semibold ${elementColors[weakestElement]}`}>{weakestElement}</span>
      </p>
    </div>
  );
}

// ── 命盘档案卡片（reveal） ────────────────────────────────────
function ArchiveCard({ chart, place }: { chart: BaziChart; place: string }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-ember">命盘档案</p>
      <dl className="mt-4 space-y-3.5">
        <div>
          <dt className="text-xs text-moss">出生时间</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">
            {chart.input.birthDate}{" "}
            {chart.input.birthTimeUnknown
              ? <span className="text-moss">时辰不确定</span>
              : chart.input.birthTime}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-moss">出生地点</dt>
          <dd className="mt-0.5 break-words text-sm font-medium text-ink">{place}</dd>
        </div>
        <div>
          <dt className="text-xs text-moss">性别</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{genderLabel(chart.input.gender)}</dd>
        </div>
        <div className="border-t border-ink/10 pt-3.5">
          <dt className="text-xs text-moss">真太阳时</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">
            {chart.input.adjustedBirthDate} {chart.input.adjustedBirthTime}
          </dd>
          <dd className="mt-0.5 text-xs text-moss">修正 {chart.input.trueSolarOffsetMinutes ?? 0} 分钟</dd>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-3.5">
          {[
            { label: "胎元", value: chart.input.taiYuan,  sub: chart.input.taiYuanNaYin },
            { label: "命宫", value: chart.input.mingGong, sub: chart.input.mingGongNaYin },
            { label: "身宫", value: chart.input.shenGong, sub: chart.input.shenGongNaYin },
          ].map(({ label, value, sub }) => (
            <div key={label}>
              <p className="text-xs text-moss">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
              <p className="mt-0.5 text-xs leading-4 text-moss/70">{sub}</p>
            </div>
          ))}
        </div>
      </dl>
    </div>
  );
}

// ── 问诊主题卡片 ──────────────────────────────────────────────
function QuestionCard({ question }: { question: string }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0.18s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.18s",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-ember">问诊主题</p>
      <p className="mt-3 text-sm leading-7 text-ink/80">{question}</p>
    </div>
  );
}

// ── 神煞区块（reveal + tag pop-in stagger） ──────────────────────
function ShenShaSection({ columns }: { columns: ChartColumn[] }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">神煞</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">四柱神煞分布</h2>
        </div>
        <div className="flex gap-4 text-xs text-moss">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-jade" />吉神</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ember" />凶煞</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink/20" />其他</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col, ci) => (
          <div key={col.label} className="rounded-lg border border-ink/10 bg-paper/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{col.label}</span>
              <span className="text-sm text-moss">{col.heavenlyStem.value}{col.earthlyBranch.value}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {col.symbolicStars.length > 0 ? (
                col.symbolicStars.map((star, si) => (
                  <ShenShaTag
                    key={`${col.label}-${star}`}
                    star={star}
                    className={`opacity-0 rounded-md px-2.5 py-1 text-sm font-medium ${starTagClass(star)} ${visible ? "animate-pop-in" : ""}`}
                    style={{ animationDelay: `${(ci * 4 + si) * 55 + 120}ms` }}
                  />
                ))
              ) : (
                <span className="text-sm text-moss/60">无明显神煞</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 桌面端侧栏 ────────────────────────────────────────────────
function Sidebar({ chart, place, maxElement }: { chart: BaziChart; place: string; maxElement: number }) {
  return (
    <aside className="space-y-4">
      <ArchiveCard chart={chart} place={place} />
      <FiveElementsCard
        fiveElements={chart.fiveElements}
        maxElement={maxElement}
        strongestElement={chart.summary.strongestElement}
        weakestElement={chart.summary.weakestElement}
      />
      {chart.input.question && <QuestionCard question={chart.input.question} />}
    </aside>
  );
}

// ── 主页面 ────────────────────────────────────────────────────
export default function BaziResultPage() {
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedError = sessionStorage.getItem("bazi:error");
      const raw = sessionStorage.getItem("bazi:chart");
      if (storedError) {
        setError(storedError);
        sessionStorage.removeItem("bazi:error");
        return;
      }
      if (raw) setChart(JSON.parse(raw) as BaziChart);
    } catch {
      setError("命盘缓存读取失败，请返回重新排盘。");
      sessionStorage.removeItem("bazi:chart");
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-ink">
        <section className="max-w-md rounded-xl border border-ink/10 bg-white/80 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-ember">整理命盘结果</p>
          <h1 className="mt-2 text-2xl font-semibold">正在读取排盘</h1>
          <p className="mt-3 leading-7 text-moss">请稍候片刻。</p>
        </section>
      </main>
    );
  }

  if (error || !chart) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-ink">
        <section className="max-w-md rounded-xl border border-ink/10 bg-white/80 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">{error ? "排盘失败" : "没有找到排盘结果"}</h1>
          <p className="mt-3 leading-7 text-moss">{error || "请返回重新填写出生信息。"}</p>
          <Link href="/bazi" className="mt-6 inline-flex rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade">
            返回填写
          </Link>
        </section>
      </main>
    );
  }

  const place = [
    chart.input.birthCountry, chart.input.birthState,
    chart.input.birthCity,    chart.input.birthPlaceDetail,
  ].filter(Boolean).join(" · ");
  const maxElement = Math.max(...Object.values(chart.fiveElements), 1);
  const canAskMaster = hasSecondaryInfo(chart.input);

  return (
    // pb-24 reserves space for mobile sticky CTA; xl resets it
    <main className="min-h-screen px-4 pb-24 pt-5 text-ink sm:px-6 lg:px-8 xl:pb-5">
      <div className="mx-auto max-w-[1400px]">
        <SiteNav showRefill />

        {/* ── 暗色 header：日主 + 四柱（stagger) + 五行强弱 ─── */}
        <header className="mt-4 overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(21,19,15,0.22)]">
          <div className="relative bg-[radial-gradient(circle_at_15%_60%,rgba(199,169,93,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(47,125,109,0.14),transparent_38%),linear-gradient(150deg,#1a1611,#221d15)] px-5 py-7 sm:px-8 sm:py-9">
            {/* 呼吸金光叠层 */}
            <div className="animate-header-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(199,169,93,0.28),transparent_52%)]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* 左：日主 + 五行标签 */}
              <div className="flex items-center gap-4">
                <div className="opacity-0 animate-ink-reveal grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#c9a85d]/40 text-2xl text-[#c9a85d]">
                  ☯
                </div>
                <div>
                  <p
                    className="opacity-0 animate-ink-reveal text-xs font-semibold uppercase tracking-widest text-[#c9a85d]/80"
                    style={{ animationDelay: "60ms" }}
                  >
                    八字排盘
                  </p>
                  <p
                    className="opacity-0 animate-ink-reveal mt-1 text-3xl font-semibold text-white sm:text-4xl"
                    style={{ animationDelay: "120ms" }}
                  >
                    日主 {chart.dayMaster}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`opacity-0 animate-fade-up rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold ${elementColorsDark[chart.summary.strongestElement]}`}
                      style={{ animationDelay: "220ms" }}
                    >
                      最显 · {chart.summary.strongestElement}
                    </span>
                    <span
                      className="opacity-0 animate-fade-up rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/45"
                      style={{ animationDelay: "290ms" }}
                    >
                      较弱 · {chart.summary.weakestElement}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右：四柱逐列淡入 */}
              <div className="flex items-end gap-5 sm:gap-7">
                {chart.columns.map((col, i) => (
                  <div
                    key={col.label}
                    className="opacity-0 animate-fade-up text-center"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <p className="mb-2 text-xs text-white/40">{col.label}</p>
                    <p className={`text-3xl font-bold leading-none sm:text-4xl ${elementColorsDark[col.heavenlyStem.element] ?? "text-white"}`}>
                      {col.heavenlyStem.value}
                    </p>
                    <p className={`mt-2 text-3xl font-bold leading-none sm:text-4xl ${elementColorsDark[col.earthlyBranch.element] ?? "text-white"}`}>
                      {col.earthlyBranch.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 时辰不确定提示 */}
        {chart.input.birthTimeUnknown && (
          <p className="opacity-0 animate-fade-up mt-4 rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm leading-6 text-ember"
            style={{ animationDelay: "400ms" }}>
            你选择了"时辰不确定"，时柱、部分神煞与宫位信息会带有参考性偏差，后续解读建议重点看年、月、日柱。
          </p>
        )}

        {/* ── 主内容双栏 ─────────────────────────────────────── */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px] 2xl:grid-cols-[1fr_380px]">

          {/* 左栏 */}
          <div className="space-y-5">

            {/* 桌面端紧凑表（md+）*/}
            <div className="hidden overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-ink/10 bg-paper/60">
                      <th className="w-28 px-4 py-3 text-sm font-medium text-moss" />
                      {chart.columns.map((col) => (
                        <th key={col.label} className="px-5 py-3 text-center">
                          <span className="text-sm font-semibold text-ink">{col.label}</span>
                          <span className="ml-2 text-xs text-moss/60">
                            {col.heavenlyStem.value}{col.earthlyBranch.value}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowLabels.map((row, i) => (
                      <tr key={row} className={`border-b border-ink/5 ${i % 2 === 0 ? "bg-paper/30" : "bg-white/60"}`}>
                        <th className="px-4 py-3 align-top text-sm font-medium text-moss">{row}</th>
                        {chart.columns.map((col) => (
                          <td key={`${row}-${col.label}`} className="px-5 py-3 align-top text-center">
                            {renderCell(row, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile 柱卡片（stagger） */}
            <div className="grid gap-4 md:hidden">
              {chart.columns.map((col, i) => (
                <PillarCard key={col.label} column={col} delay={i * 80} />
              ))}
            </div>

            {/* Mobile：五行分布提前到神煞之前 */}
            <div className="xl:hidden">
              <FiveElementsCard
                fiveElements={chart.fiveElements}
                maxElement={maxElement}
                strongestElement={chart.summary.strongestElement}
                weakestElement={chart.summary.weakestElement}
              />
            </div>

            {/* 神煞区块 */}
            <ShenShaSection columns={chart.columns} />

            {/* Mobile：档案 + 问诊主题（神煞之后） */}
            <div className="space-y-4 xl:hidden">
              <ArchiveCard chart={chart} place={place} />
              {chart.input.question && <QuestionCard question={chart.input.question} />}
            </div>
          </div>

          {/* 桌面端 sticky 侧栏 */}
          <div className="hidden xl:block">
            <div className="sticky top-5">
              <Sidebar chart={chart} place={place} maxElement={maxElement} />
            </div>
          </div>
        </div>

        {/* ── 桌面端底部 CTA（暗色，与 header 呼应） ────────── */}
        <div className="mt-5 hidden xl:block overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(21,19,15,0.18)]">
          <div className="relative bg-[radial-gradient(circle_at_15%_60%,rgba(199,169,93,0.18),transparent_40%),linear-gradient(150deg,#1a1611,#221d15)] px-6 py-7">
            <div className="animate-header-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(47,125,109,0.18),transparent_50%)]" />
            <div className="relative flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a85d]/80">观命先生</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {canAskMaster ? "请先生据盘细看" : "补充问诊主题后再细看"}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/50">
                  {canAskMaster
                    ? "已检测到问诊主题或辅助信息，可进入一次性解读页面。"
                    : "当前只有基础命盘。若想看事业、感情、流年或具体问题，建议先返回补充问诊主题。"}
                </p>
              </div>
              <Link
                href={canAskMaster ? "/bazi/master" : "/bazi"}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#c9a85d] px-6 py-3 text-sm font-semibold text-[#1a1611] transition hover:bg-[#e0bc7a] focus:outline-none focus:ring-2 focus:ring-[#c9a85d]/40"
              >
                {canAskMaster ? "请先生解盘" : "返回补充问题"}
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky 底部 CTA（fixed，xl 以上隐藏） ──── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/10 bg-white/90 px-4 py-3 shadow-[0_-8px_32px_rgba(27,22,15,0.12)] backdrop-blur-lg xl:hidden">
        <Link
          href={canAskMaster ? "/bazi/master" : "/bazi"}
          className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-jade active:scale-[0.98]"
        >
          {canAskMaster ? "观命先生据盘细解" : "返回补充问诊信息"}
          <span>→</span>
        </Link>
      </div>
    </main>
  );
}
