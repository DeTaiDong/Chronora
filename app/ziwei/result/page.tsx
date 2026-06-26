"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ZiweiChart, Palace, StarEntry } from "@/lib/ziwei/types";
import { ZIWEI_STAR_INFO } from "@/lib/ziwei-star-info";
import SiteNav from "@/components/SiteNav";
import ZiweiStarTag from "@/components/ZiweiStarTag";

function groupAuxStars(stars: StarEntry[]) {
  return {
    support: stars.filter((star) => ZIWEI_STAR_INFO[star.name]?.category === "吉辅"),
    harsh: stars.filter((star) => ZIWEI_STAR_INFO[star.name]?.category === "煞忌"),
    minor: stars.filter((star) => {
      const category = ZIWEI_STAR_INFO[star.name]?.category;
      return !category || category === "杂曜";
    })
  };
}

function StarGroup({
  title,
  stars,
  variant = "aux"
}: {
  title: string;
  stars: StarEntry[];
  variant?: "aux" | "minor";
}) {
  if (stars.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold tracking-wide text-moss/70">{title}</p>
      <div className="flex flex-wrap gap-1">
        {stars.map((star) => (
          <ZiweiStarTag key={`${title}-${star.name}`} star={star} isMain={false} variant={variant} />
        ))}
      </div>
    </div>
  );
}

// ── 单宫格 ─────────────────────────────────────────────────────────────────
function PalaceCell({ palace, delay }: { palace: Palace; delay: number }) {
  const groupedAuxStars = groupAuxStars(palace.auxStars);
  const highlightClass = palace.isDestinyPalace
    ? "border-[rgba(138,106,53,.55)] shadow-[0_0_0_4px_rgba(201,168,106,.12),0_16px_34px_rgba(86,62,30,.10)]"
    : palace.isBodyPalace
      ? "border-jade/45 shadow-[0_0_0_3px_rgba(111,127,79,.10)]"
      : "border-ink/10 shadow-sm";

  return (
    <div
      className={`relative flex min-h-[170px] flex-col overflow-hidden rounded-lg border-2 bg-white/68 backdrop-blur-sm opacity-0 animate-fade-up sm:min-h-[190px] ${highlightClass}`}
      style={{ animationDelay: `${delay}ms`, borderColor: undefined }}
    >
      {/* 宫名 + 干支 */}
      <div className="relative flex items-start justify-between border-b border-ink/8 bg-white/55 px-3 py-2.5">
        <div>
          <span className="text-sm font-semibold text-ink">{palace.name}</span>
          {(palace.isDestinyPalace || palace.isBodyPalace) && (
            <div className="mt-1 flex gap-1">
              {palace.isDestinyPalace && (
                <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-dark">命</span>
              )}
              {palace.isBodyPalace && (
                <span className="rounded bg-jade/15 px-1.5 py-0.5 text-[10px] font-bold text-jade">身</span>
              )}
            </div>
          )}
        </div>
        <span className="rounded bg-paper/80 px-2 py-1 text-xs font-medium text-moss">
          {palace.stem}{palace.branch}
        </span>
      </div>

      {/* 主星 */}
      <div className="relative px-3 py-3">
        <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-gold-dark/70">
          主星
        </p>
        <div className="flex min-h-8 flex-wrap gap-1.5">
          {palace.mainStars.length > 0 ? (
            palace.mainStars.map((star) => (
              <ZiweiStarTag key={star.name} star={star} isMain />
            ))
          ) : (
            <span className="rounded-md border border-ink/10 bg-white/65 px-2.5 py-1 text-sm text-moss/70">
              空宫
            </span>
          )}
        </div>
      </div>

      {/* 辅星 / 杂曜 / 神煞 */}
      <div className="relative mt-auto space-y-2 border-t border-ink/8 bg-paper/35 px-3 py-2.5">
        <StarGroup title="辅星" stars={groupedAuxStars.support} />
        <StarGroup title="煞忌" stars={groupedAuxStars.harsh} />
          <StarGroup title="杂曜 / 神煞" stars={groupedAuxStars.minor} variant="minor" />
        {palace.auxStars.length === 0 ? (
          <p className="text-xs text-moss/55">辅星 / 杂曜暂未见</p>
        ) : null}
      </div>
    </div>
  );
}

// ── 12宫布局（外环+中心信息） ──────────────────────────────────────────────
// 传统紫微命盘为 4×4 方格，外圈12宫，中心显示命盘摘要
// 宫位顺序（顺时针从左下角起）：
// 行0: [寅,卯,辰,巳]
// 行1: [丑,     午] (中间两格为命盘摘要)
// 行2: [子,     未]
// 行3: [亥,戌,酉,申]
const GRID_POSITIONS: number[] = [
  2,  3,  4,  5,   // 行0: 寅卯辰巳
  1,            6, // 行1: 丑 (空空) 午
  0,            7, // 行2: 子 (空空) 未
  11, 10, 9,  8,   // 行3: 亥戌酉申
];

// ── 主结果页 ───────────────────────────────────────────────────────────────
export default function ZiweiResultPage() {
  const router = useRouter();
  const [chart, setChart] = useState<ZiweiChart | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ziwei:chart");
    if (!raw) { router.replace("/ziwei"); return; }
    setChart(JSON.parse(raw) as ZiweiChart);
  }, [router]);

  if (!chart) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper">
        <p className="text-sm text-moss animate-pulse">命盘加载中……</p>
      </main>
    );
  }

  const { palaces, lunar, fivePhase, destinyPalaceIndex, daYun } = chart;

  // 命盘 4×4 格的宫位顺序
  const gridPalaces = GRID_POSITIONS.map((branchIdx) => palaces[branchIdx]);

  const canAskMaster = !!(
    chart.input.question?.trim() ||
    chart.input.careerStatus?.trim() ||
    chart.input.relationshipStatus?.trim()
  );

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SiteNav showRefill />

        {/* ── 命盘头部 ──────────────────────────────────────────────── */}
        <header className="relative mt-5 overflow-hidden rounded-lg bg-[linear-gradient(150deg,#1a1611,#2d261b)] px-5 py-7 shadow-[0_18px_52px_rgba(21,19,15,0.2)] sm:px-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(201,168,93,0.22),transparent_60%)] animate-header-glow" />

          <p className="relative text-xs font-semibold uppercase tracking-widest text-[#c9a85d] opacity-0 animate-ink-reveal">
            紫微斗数 · 命盘
          </p>
          <div className="relative mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold text-white sm:text-4xl opacity-0 animate-ink-reveal"
                style={{ animationDelay: "80ms" }}
              >
                {fivePhase.name} · {palaces[destinyPalaceIndex].stem}{palaces[destinyPalaceIndex].branch}命宫
              </h1>
              <p
                className="mt-2 text-sm text-white/60 opacity-0 animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                农历 {lunar.yearGanZhi}年 {lunar.month}月{lunar.day}日 ·{" "}
                {chart.input.gender === "male" ? "男" : "女"} ·{" "}
                {chart.input.birthTimeUnknown ? "时辰不详" : `${palaces[destinyPalaceIndex].stem}${palaces[destinyPalaceIndex].branch}时`}
              </p>
              <p
                className="mt-1 text-xs text-[#c9a85d]/70 opacity-0 animate-fade-up"
                style={{ animationDelay: "280ms" }}
              >
                起运 {fivePhase.startAge} 岁 · 命宫主星：
                {palaces[destinyPalaceIndex].mainStars.map((s) => s.name).join("、") || "空宫"}
              </p>
            </div>

            {canAskMaster && (
              <Link
                href="/ziwei/master"
                className="inline-flex items-center gap-2 rounded-lg border border-[#c9a85d]/40 bg-[#c9a85d]/15 px-5 py-2.5 text-sm font-semibold text-[#c9a85d] transition hover:bg-[#c9a85d]/25 opacity-0 animate-fade-up"
                style={{ animationDelay: "360ms" }}
              >
                请观命先生细看 →
              </Link>
            )}
          </div>
        </header>

        {/* ── 12宫格命盘 ──────────────────────────────────────────── */}
        <section className="mt-5">
          {/* 4×4 grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* 行0: 寅卯辰巳 */}
            {gridPalaces.slice(0, 4).map((p, i) => (
              <PalaceCell key={p.index} palace={p} delay={i * 60 + 400} />
            ))}
            {/* 行1: 丑 [中心×2] 午 */}
            <PalaceCell palace={gridPalaces[4]} delay={4 * 60 + 400} />
            {/* 中心格（2×2）- 命盘摘要 */}
            <div
              className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-lg border border-ink/10 bg-white/82 p-5 text-center opacity-0 animate-fade-up"
              style={{ animationDelay: "760ms" }}
            >
              <p className="font-zh-title text-3xl text-gold-dark sm:text-4xl">
                {fivePhase.name}
              </p>
              <p className="mt-3 text-sm font-medium text-moss">
                {lunar.yearGanZhi}年 · {chart.input.gender === "male" ? "男" : "女"}
              </p>
              <div className="mt-4 space-y-1.5 text-sm text-ink/65">
                <p>命宫 {palaces[destinyPalaceIndex].stem}{palaces[destinyPalaceIndex].branch}</p>
                <p>身宫 {palaces[chart.bodyPalaceIndex].stem}{palaces[chart.bodyPalaceIndex].branch}</p>
                <p>起运 {fivePhase.startAge} 岁</p>
              </div>
            </div>
            <PalaceCell palace={gridPalaces[5]} delay={5 * 60 + 400} />
            {/* 行2: 子 [中心×2] 未 */}
            <PalaceCell palace={gridPalaces[6]} delay={6 * 60 + 400} />
            <PalaceCell palace={gridPalaces[7]} delay={7 * 60 + 400} />
            {/* 行3: 亥戌酉申 */}
            {gridPalaces.slice(8, 12).map((p, i) => (
              <PalaceCell key={p.index} palace={p} delay={(8 + i) * 60 + 400} />
            ))}
          </div>
        </section>

        {/* ── 大运表 ──────────────────────────────────────────────── */}
        <section className="mt-5 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ember">大运</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">八步大运走势</h2>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {daYun.map((dy) => (
              <div
                key={dy.index}
                className="rounded-md border border-ink/10 bg-paper/45 p-3 text-center"
              >
                <p className="text-base font-semibold text-ink">{dy.stem}{dy.branch}</p>
                <p className="mt-1 text-xs text-moss">{dy.palaceName}</p>
                <p className="text-xs text-ink/40">{dy.startAge}–{dy.endAge}岁</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 底部 CTA ─────────────────────────────────────────────── */}
        {canAskMaster && (
          <div className="mt-5 rounded-lg bg-[linear-gradient(135deg,#1a1611,#2d261b)] px-6 py-6 text-center shadow-lg">
            <p className="text-sm font-semibold text-[#c9a85d]">观命先生</p>
            <p className="mt-1 text-lg font-semibold text-white">命盘已排，可请先生据盘细解</p>
            <Link
              href="/ziwei/master"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#c9a85d] px-6 py-2.5 text-sm font-bold text-[#1a1611] transition hover:bg-[#d4b86a]"
            >
              请先生解读 →
            </Link>
          </div>
        )}

        <div className="mt-6 pb-6 text-center">
          <Link href="/ziwei" className="text-sm text-moss/60 underline underline-offset-4 hover:text-jade">
            重新排盘
          </Link>
          <span className="mx-3 text-ink/15">·</span>
          <Link href="/" className="text-sm text-moss/60 underline underline-offset-4 hover:text-jade">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
