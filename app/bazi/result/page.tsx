"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BaziChart, ChartColumn } from "@/app/bazi/chartEngine";

const elementColors: Record<string, string> = {
  木: "text-emerald-600",
  火: "text-red-600",
  土: "text-yellow-700",
  金: "text-zinc-500",
  水: "text-blue-600"
};

const rowLabels = ["主星", "天干", "地支", "藏干 / 副星", "星运", "自坐", "空亡", "纳音"] as const;

function genderLabel(value?: string) {
  return { female: "女", male: "男", other: "其他 / 不便分类" }[value ?? ""] ?? value;
}

function hiddenStemList(column: ChartColumn) {
  return column.hiddenStems.map((item) => (
    <p key={`${column.label}-${item.stem}`} className={elementColors[item.element]}>
      {item.stem}
      {item.element}
      <span className="ml-2 text-[#4b4638]/75">{item.tenGod}</span>
    </p>
  ));
}

function renderCell(row: (typeof rowLabels)[number], column: ChartColumn) {
  if (row === "主星") return <span className="font-semibold">{column.mainStar}</span>;

  if (row === "天干") {
    return (
      <span className={`text-5xl font-semibold ${elementColors[column.heavenlyStem.element]}`}>
        {column.heavenlyStem.value}
        <span className="ml-1 text-2xl">{column.heavenlyStem.emoji}</span>
      </span>
    );
  }

  if (row === "地支") {
    return (
      <span className={`text-5xl font-semibold ${elementColors[column.earthlyBranch.element]}`}>
        {column.earthlyBranch.value}
        <span className="ml-1 text-2xl">{column.earthlyBranch.emoji}</span>
      </span>
    );
  }

  if (row === "藏干 / 副星") return <div className="space-y-1.5">{hiddenStemList(column)}</div>;
  if (row === "星运") return column.lifeStage;
  if (row === "自坐") return column.selfSeat;
  if (row === "空亡") return column.voidBranches;
  return column.nayin;
}

function InfoCards({ chart, place, maxElement }: { chart: BaziChart; place: string; maxElement: number }) {
  return (
    <aside className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
      <section className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7]/90 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">录入信息</h2>
        <dl className="mt-4 space-y-3 text-sm leading-6 text-[#6f654f]">
          <div>
            <dt className="font-semibold text-[#211b12]">出生日期</dt>
            <dd>
              {chart.input.birthDate} {chart.input.birthTimeUnknown ? "时辰不确定" : chart.input.birthTime}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#211b12]">出生地点</dt>
            <dd className="break-words">{place}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#211b12]">性别</dt>
            <dd>{genderLabel(chart.input.gender)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7]/90 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">五行分布</h2>
        <div className="mt-5 space-y-4">
          {Object.entries(chart.fiveElements).map(([element, value]) => (
            <div key={element} className="grid grid-cols-[32px_1fr_32px] items-center gap-3 text-sm">
              <span className={`font-semibold ${elementColors[element]}`}>{element}</span>
              <div className="h-3 overflow-hidden rounded-full bg-[#ded8c8]">
                <div className="h-full rounded-full bg-[#2f7d6d]" style={{ width: `${(value / maxElement) * 100}%` }} />
              </div>
              <span className="text-right text-[#6f654f]">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[#6f654f]">
          当前最显：{chart.summary.strongestElement}，当前较弱：{chart.summary.weakestElement}。
        </p>
      </section>

      <section className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7]/90 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">命局附录</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-[#6f654f]">
          <p>胎元：{chart.input.taiYuan} · {chart.input.taiYuanNaYin}</p>
          <p>命宫：{chart.input.mingGong} · {chart.input.mingGongNaYin}</p>
          <p>身宫：{chart.input.shenGong} · {chart.input.shenGongNaYin}</p>
        </div>
      </section>

      {chart.input.question ? (
        <section className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7]/90 p-5 shadow-sm md:col-span-3 xl:col-span-1">
          <h2 className="text-xl font-semibold">用户问题</h2>
          <p className="mt-3 text-sm leading-7 text-[#6f654f]">{chart.input.question}</p>
        </section>
      ) : null}
    </aside>
  );
}

export default function BaziResultPage() {
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedError = sessionStorage.getItem("bazi:error");
    const raw = sessionStorage.getItem("bazi:chart");

    if (storedError) {
      setError(storedError);
      sessionStorage.removeItem("bazi:error");
      return;
    }

    if (raw) setChart(JSON.parse(raw) as BaziChart);
  }, []);

  if (error || !chart) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f0e4] px-5 text-[#211b12]">
        <section className="max-w-md rounded-lg border border-[#d8ceb8] bg-[#fffdf7] p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">{error ? "排盘失败" : "没有找到排盘结果"}</h1>
          <p className="mt-3 leading-7 text-[#6f654f]">{error || "请返回重新填写出生信息。"}</p>
          <Link href="/bazi" className="mt-5 inline-flex rounded-md bg-[#211b12] px-5 py-3 text-sm font-semibold text-white">
            返回填写
          </Link>
        </section>
      </main>
    );
  }

  const place = [chart.input.birthCountry, chart.input.birthState, chart.input.birthCity, chart.input.birthPlaceDetail]
    .filter(Boolean)
    .join(" · ");
  const maxElement = Math.max(...Object.values(chart.fiveElements), 1);

  return (
    <main className="min-h-screen bg-[#f5f0e4] px-4 py-5 text-[#211b12] sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <nav className="flex items-center justify-between py-2">
          <Link href="/bazi" className="font-semibold text-[#2f7d6d]">
            返回重新填写
          </Link>
          <Link href="/" className="rounded-md border border-[#d2c6ad] bg-[#fffdf7]/80 px-4 py-2 text-sm font-medium">
            首页
          </Link>
        </nav>

        <header className="mt-5 overflow-hidden rounded-lg border border-[#d8ceb8] bg-[#15130f] shadow-[0_18px_50px_rgba(45,33,18,0.18)]">
          <div className="bg-[radial-gradient(circle_at_20%_10%,rgba(199,169,93,0.22),transparent_32%),linear-gradient(135deg,#191713,#302719)] px-5 py-7 text-[#f7efd8] md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full border border-[#c9a85d] text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  ☯
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#c9a85d]">八字排盘</p>
                  <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">日主 {chart.dayMaster}</h1>
                </div>
              </div>
              <div className="space-y-1 text-sm leading-6 text-[#f3e7c6] sm:text-base">
                <p>历法：{chart.input.calendarProvider}</p>
                <p>
                  真太阳时：{chart.input.adjustedBirthDate} {chart.input.adjustedBirthTime}
                </p>
                <p>修正：{chart.input.trueSolarOffsetMinutes ?? 0} 分钟</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <div className="hidden overflow-hidden rounded-lg border border-[#d8ceb8] bg-[#fffdf7] shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#fffdf7]">
                      <th className="w-36 px-5 py-4 text-lg font-medium text-[#867a62]">日期</th>
                      {chart.columns.map((column) => (
                        <th key={column.label} className="px-6 py-4 text-center text-lg font-medium text-[#867a62]">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowLabels.map((row, rowIndex) => (
                      <tr key={row} className={rowIndex % 2 === 0 ? "bg-[#f4efe5]" : "bg-[#fffdf7]"}>
                        <th className="px-5 py-4 align-top text-lg font-medium text-[#536b5d]">{row}</th>
                        {chart.columns.map((column) => (
                          <td key={`${row}-${column.label}`} className="px-6 py-4 align-top text-center text-xl">
                            {renderCell(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 md:hidden">
              {chart.columns.map((column) => (
                <article key={column.label} className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7] p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#a16d18]">{column.label}</p>
                      <p className="mt-1 text-lg font-semibold">{column.mainStar}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-4xl font-semibold ${elementColors[column.heavenlyStem.element]}`}>
                        {column.heavenlyStem.value}
                        <span className="ml-1 text-xl">{column.heavenlyStem.emoji}</span>
                      </p>
                      <p className={`mt-2 text-4xl font-semibold ${elementColors[column.earthlyBranch.element]}`}>
                        {column.earthlyBranch.value}
                        <span className="ml-1 text-xl">{column.earthlyBranch.emoji}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-[#6f654f]">
                    <div>
                      <p className="font-semibold text-[#211b12]">藏干 / 副星</p>
                      <div className="mt-1 space-y-1">{hiddenStemList(column)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p>星运：{column.lifeStage}</p>
                      <p>自坐：{column.selfSeat}</p>
                      <p>空亡：{column.voidBranches}</p>
                      <p>纳音：{column.nayin}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className="rounded-lg border border-[#d8ceb8] bg-[#fffdf7] p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#a16d18]">神煞</p>
                  <h2 className="mt-1 text-2xl font-semibold">四柱神煞分布</h2>
                </div>
                <p className="text-sm text-[#6f654f]">从主表拆出，移动端更容易查看。</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {chart.columns.map((column) => (
                  <div key={column.label} className="rounded-md border border-[#e4d8bd] bg-[#fbf7ea] p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{column.label}</h3>
                      <span className="text-sm text-[#a16d18]">
                        {column.heavenlyStem.value}
                        {column.earthlyBranch.value}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {column.symbolicStars.length > 0 ? (
                        column.symbolicStars.map((star) => (
                          <span key={`${column.label}-${star}`} className="rounded bg-[#f2e5c3] px-2.5 py-1 text-sm text-[#8a5d12]">
                            {star}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#867a62]">无明显神煞</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <InfoCards chart={chart} place={place} maxElement={maxElement} />
        </section>
      </div>
    </main>
  );
}
