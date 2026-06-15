"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BaziChart, ChartColumn } from "@/app/bazi/chartEngine";
import { hasSecondaryInfo } from "@/lib/fortune-master";
import SiteNav from "@/components/SiteNav";

// ---- 五行颜色 ----
const elementColors: Record<string, string> = {
  木: "text-emerald-600",
  火: "text-red-500",
  土: "text-yellow-700",
  金: "text-zinc-400",
  水: "text-blue-500"
};

const elementColorsDark: Record<string, string> = {
  木: "text-emerald-400",
  火: "text-red-400",
  土: "text-yellow-300",
  金: "text-zinc-300",
  水: "text-blue-400"
};

const elementBarColors: Record<string, string> = {
  木: "bg-emerald-500",
  火: "bg-red-500",
  土: "bg-yellow-600",
  金: "bg-zinc-400",
  水: "bg-blue-500"
};

// ---- 神煞分类 ----
const auspiciousStars = new Set([
  "天乙贵人", "太极贵人", "文昌贵人", "天厨贵人", "国印贵人",
  "金舆", "红鸾", "天喜", "将星", "月德", "德秀贵人", "天医"
]);
const inauspiciousStars = new Set([
  "血刃", "飞刃", "亡神", "劫煞", "灾煞", "九丑日", "阴差阳错", "童子煞"
]);

function starTagClass(star: string) {
  if (auspiciousStars.has(star))
    return "border border-jade/30 bg-jade/10 text-jade";
  if (inauspiciousStars.has(star))
    return "border border-ember/30 bg-ember/10 text-ember";
  return "border border-ink/15 bg-ink/5 text-moss";
}

// ---- 工具函数 ----
function genderLabel(value?: string) {
  return { female: "女", male: "男", other: "其他 / 不便分类" }[value ?? ""] ?? value;
}

function pillarText(column: ChartColumn) {
  return `${column.heavenlyStem.value}${column.earthlyBranch.value}`;
}

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

// ---- 主表（桌面端）----
const rowLabels = ["主星", "天干", "地支", "藏干 / 副星", "星运", "空亡", "纳音"] as const;

function renderCell(row: (typeof rowLabels)[number], column: ChartColumn) {
  if (row === "主星")
    return <span className="text-base font-semibold text-ink">{column.mainStar}</span>;

  if (row === "天干")
    return (
      <span className={`text-5xl font-semibold leading-none ${elementColors[column.heavenlyStem.element]}`}>
        {column.heavenlyStem.value}
        <span className="ml-1.5 text-xl opacity-50">{column.heavenlyStem.emoji}</span>
      </span>
    );

  if (row === "地支")
    return (
      <span className={`text-5xl font-semibold leading-none ${elementColors[column.earthlyBranch.element]}`}>
        {column.earthlyBranch.value}
        <span className="ml-1.5 text-xl opacity-50">{column.earthlyBranch.emoji}</span>
      </span>
    );

  if (row === "藏干 / 副星") return <HiddenStemList column={column} />;
  if (row === "星运") return <span className="text-base text-ink">{column.lifeStage}</span>;
  if (row === "空亡") return <span className="text-base text-ink">{column.voidBranches}</span>;
  return <span className="text-base text-ink">{column.nayin}</span>;
}

// ---- 移动端柱卡片 ----
function PillarCard({ column }: { column: ChartColumn }) {
  return (
    <article className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">{column.label}</p>
          <p className="mt-2 text-xl font-semibold text-ink">{column.mainStar}</p>
        </div>
        <div className="flex gap-5">
          <div className="text-center">
            <p className="mb-1.5 text-xs text-moss">天干</p>
            <p className={`text-4xl font-semibold leading-none ${elementColors[column.heavenlyStem.element]}`}>
              {column.heavenlyStem.value}
            </p>
            <p className="mt-1 text-base opacity-40">{column.heavenlyStem.emoji}</p>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-xs text-moss">地支</p>
            <p className={`text-4xl font-semibold leading-none ${elementColors[column.earthlyBranch.element]}`}>
              {column.earthlyBranch.value}
            </p>
            <p className="mt-1 text-base opacity-40">{column.earthlyBranch.emoji}</p>
          </div>
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
          { label: "纳音", value: column.nayin }
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

// ---- 神煞区块 ----
function ShenShaSection({ columns }: { columns: ChartColumn[] }) {
  return (
    <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">神煞</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">四柱神煞分布</h2>
        </div>
        <div className="flex gap-4 text-xs text-moss">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-jade" />吉神
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ember" />凶煞
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink/20" />其他
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.label} className="rounded-lg border border-ink/10 bg-paper/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{column.label}</span>
              <span className="text-sm text-moss">
                {column.heavenlyStem.value}{column.earthlyBranch.value}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {column.symbolicStars.length > 0 ? (
                column.symbolicStars.map((star) => (
                  <span
                    key={`${column.label}-${star}`}
                    className={`rounded-md px-2.5 py-1 text-sm font-medium ${starTagClass(star)}`}
                  >
                    {star}
                  </span>
                ))
              ) : (
                <span className="text-sm text-moss/60">无明显神煞</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- 顶部摘要 ----
function ResultSummary({ chart }: { chart: BaziChart }) {
  const pillars = chart.columns.map(pillarText).join(" / ");
  const trueSolarTime = [chart.input.adjustedBirthDate, chart.input.adjustedBirthTime].filter(Boolean).join(" ");
  const offset = chart.input.trueSolarOffsetMinutes ?? 0;
  const hasUnknownTime = Boolean(chart.input.birthTimeUnknown);

  const items = [
    { label: "四柱", value: pillars },
    { label: "最显五行", value: chart.summary.strongestElement, element: chart.summary.strongestElement },
    { label: "较弱五行", value: chart.summary.weakestElement, element: chart.summary.weakestElement },
    { label: "真太阳时", value: `${trueSolarTime || "未计算"} · 修正 ${offset} 分钟` }
  ];

  return (
    <section className="mt-5 rounded-xl border border-ink/10 bg-white/82 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">命盘速览</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            日主 <span className={elementColors[chart.columns[2]?.heavenlyStem.element] ?? ""}>{chart.dayMaster}</span>
            ，先看五行与四柱结构
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            这里先展示排盘结果本身；如果填写了问诊主题或辅助信息，可继续进入“观命先生”做一次性解读。
          </p>
        </div>
        <Link
          href="/bazi"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-ink/15 bg-white/70 px-4 py-2.5 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
        >
          重新填写
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-ink/10 bg-paper/45 p-4">
            <p className="text-xs text-moss">{item.label}</p>
            <p className={`mt-1 text-base font-semibold leading-6 ${item.element ? elementColors[item.element] : "text-ink"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {hasUnknownTime ? (
        <p className="mt-4 rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm leading-6 text-ember">
          你选择了“时辰不确定”，时柱、部分神煞与宫位信息会带有参考性偏差，后续解读建议重点看年、月、日柱。
        </p>
      ) : null}
    </section>
  );
}

// ---- 侧栏 ----
function Sidebar({ chart, place, maxElement }: { chart: BaziChart; place: string; maxElement: number }) {
  return (
    <aside className="space-y-4">
      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">命盘档案</p>
        <dl className="mt-4 space-y-3.5">
          <div>
            <dt className="text-xs text-moss">出生时间</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {chart.input.birthDate}{" "}
              {chart.input.birthTimeUnknown ? (
                <span className="text-moss">时辰不确定</span>
              ) : (
                chart.input.birthTime
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-moss">出生地点</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink break-words">{place}</dd>
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
            <dd className="mt-0.5 text-xs text-moss">
              修正 {chart.input.trueSolarOffsetMinutes ?? 0} 分钟
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-3.5">
            {[
              { label: "胎元", value: chart.input.taiYuan, sub: chart.input.taiYuanNaYin },
              { label: "命宫", value: chart.input.mingGong, sub: chart.input.mingGongNaYin },
              { label: "身宫", value: chart.input.shenGong, sub: chart.input.shenGongNaYin }
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <p className="text-xs text-moss">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
                <p className="mt-0.5 text-xs text-moss/70 leading-4">{sub}</p>
              </div>
            ))}
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">五行</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">五行分布</h2>
        <div className="mt-5 space-y-3.5">
          {Object.entries(chart.fiveElements).map(([element, value]) => (
            <div key={element} className="flex items-center gap-3">
              <span className={`w-5 shrink-0 text-sm font-semibold ${elementColors[element]}`}>
                {element}
              </span>
              <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${elementBarColors[element] ?? "bg-jade"}`}
                  style={{ width: `${(value / maxElement) * 100}%` }}
                />
              </div>
              <span className="w-4 shrink-0 text-right text-sm font-medium text-moss">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-moss">
          最显：
          <span className={`font-semibold ${elementColors[chart.summary.strongestElement]}`}>
            {chart.summary.strongestElement}
          </span>
          {" · "}
          较弱：
          <span className={`font-semibold ${elementColors[chart.summary.weakestElement]}`}>
            {chart.summary.weakestElement}
          </span>
        </p>
      </section>

      {chart.input.question ? (
        <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">问诊主题</p>
          <p className="mt-3 text-sm leading-7 text-ink/80">{chart.input.question}</p>
        </section>
      ) : null}
    </aside>
  );
}

// ---- 主页面 ----
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
          <h1 className="text-2xl font-semibold">
            {error ? "排盘失败" : "没有找到排盘结果"}
          </h1>
          <p className="mt-3 leading-7 text-moss">{error || "请返回重新填写出生信息。"}</p>
          <Link
            href="/bazi"
            className="mt-6 inline-flex rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade"
          >
            返回填写
          </Link>
        </section>
      </main>
    );
  }

  const place = [
    chart.input.birthCountry,
    chart.input.birthState,
    chart.input.birthCity,
    chart.input.birthPlaceDetail
  ]
    .filter(Boolean)
    .join(" · ");
  const maxElement = Math.max(...Object.values(chart.fiveElements), 1);
  const canAskMaster = hasSecondaryInfo(chart.input);

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <SiteNav />

        {/* 导航 */}
        <nav className="hidden items-center justify-between py-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-jade/40"
          >
            <div className="grid h-9 w-9 place-items-center rounded border border-ink/20 bg-white/70 text-base font-semibold shadow-sm">
              观
            </div>
            <span className="hidden text-sm font-medium text-moss sm:block">观石 · 八字排盘</span>
          </Link>
          <div className="flex gap-2.5">
            <Link
              href="/bazi"
              className="rounded-lg border border-ink/15 bg-white/60 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
            >
              重新填写
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-ink/15 bg-white/60 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
            >
              首页
            </Link>
          </div>
        </nav>

        {/* 顶部 header：日主 + 四柱 */}
        <header className="mt-4 overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(21,19,15,0.22)]">
          <div className="bg-[radial-gradient(circle_at_15%_60%,rgba(199,169,93,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(47,125,109,0.14),transparent_38%),linear-gradient(150deg,#1a1611,#221d15)] px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">

              {/* 左：日主 */}
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#c9a85d]/40 text-2xl text-[#c9a85d]">
                  ☯
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a85d]/80">
                    八字排盘
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white sm:text-4xl">
                    日主 {chart.dayMaster}
                  </p>
                </div>
              </div>

              {/* 右：四柱 */}
              <div className="flex items-end gap-6 sm:gap-8">
                {chart.columns.map((col) => (
                  <div key={col.label} className="text-center">
                    <p className="mb-2 text-xs text-white/35">{col.label}</p>
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

        <ResultSummary chart={chart} />

        {/* 主内容区 */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px] 2xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">

            {/* 桌面端主表 */}
            <div className="hidden overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-ink/10 bg-paper/60">
                      <th className="w-32 px-5 py-4 text-sm font-medium text-moss"></th>
                      {chart.columns.map((column) => (
                        <th key={column.label} className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-ink">{column.label}</span>
                          <span className="ml-2 text-xs text-moss/60">
                            {column.heavenlyStem.value}{column.earthlyBranch.value}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowLabels.map((row, i) => (
                      <tr
                        key={row}
                        className={`border-b border-ink/5 ${i % 2 === 0 ? "bg-paper/30" : "bg-white/60"}`}
                      >
                        <th className="px-5 py-4 align-top text-sm font-medium text-moss">
                          {row}
                        </th>
                        {chart.columns.map((column) => (
                          <td
                            key={`${row}-${column.label}`}
                            className="px-6 py-4 align-top text-center"
                          >
                            {renderCell(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 移动端柱卡片 */}
            <div className="grid gap-4 md:hidden">
              {chart.columns.map((column) => (
                <PillarCard key={column.label} column={column} />
              ))}
            </div>

            {/* 神煞 */}
            <ShenShaSection columns={chart.columns} />

            {/* 移动端 / 平板侧栏（xl 以下内联展示） */}
            <div className="xl:hidden">
              <Sidebar chart={chart} place={place} maxElement={maxElement} />
            </div>
          </div>

          {/* 桌面端侧栏（sticky） */}
          <div className="hidden xl:block">
            <div className="sticky top-5">
              <Sidebar chart={chart} place={place} maxElement={maxElement} />
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                观命先生
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                {canAskMaster ? "请先生据盘细看" : "补充问诊主题后再细看"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-moss">
                {canAskMaster
                  ? "已检测到问诊主题或辅助信息，可进入一次性解读页面。"
                  : "当前只有基础命盘。若想看事业、感情、流年或具体问题，建议先返回补充问诊主题。"}
              </p>
            </div>
            <Link
              href={canAskMaster ? "/bazi/master" : "/bazi"}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
            >
              {canAskMaster ? "请先生解盘" : "返回补充问题"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
