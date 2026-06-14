"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BaziChart, BaziInput } from "@/app/bazi/chartEngine";
import { generatePreviewFortuneReading } from "@/lib/fortune-master/preview";
import type { FortuneMasterResponse } from "@/lib/fortune-master";
import { hasSecondaryInfo } from "@/lib/fortune-master";

type InfoItem = {
  label: string;
  value?: string;
};

function genderLabel(value?: string) {
  return { female: "女", male: "男", other: "其他 / 不便分类" }[value ?? ""] ?? value;
}

function infoItems(input: BaziInput): InfoItem[] {
  return [
    { label: "所问主题", value: input.question },
    { label: "学历 / 学习", value: input.education },
    { label: "事业状态", value: input.careerStatus },
    { label: "感情状态", value: input.relationshipStatus },
    { label: "恋爱经历", value: input.romanceHistory },
    { label: "家庭支持", value: input.familySupport },
    { label: "重要经历", value: input.lifeEvents?.filter(Boolean).join("、") }
  ].filter((item) => item.value?.trim());
}

function ReadingBox({ reading }: { reading: FortuneMasterResponse | null }) {
  if (!reading) {
    return (
      <section className="rounded-lg border border-ink/10 bg-white/80 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">先生未开口</p>
        <p className="mt-3 text-sm leading-7 text-moss">
          用户未留下明确问题，依照规则不作空泛推断。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white/85 shadow-sm">
      <div className="border-b border-ink/10 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">
          {reading.isRefusal ? "不入命盘" : "先生批语"}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">{reading.title}</h2>
      </div>

      <textarea
        readOnly
        value={reading.answer}
        className="block min-h-[360px] w-full resize-y border-0 bg-transparent px-5 py-5 text-base leading-8 text-ink outline-none sm:px-6"
      />

      {(reading.focusAreas.length > 0 || reading.cautions.length > 0) && (
        <div className="grid gap-4 border-t border-ink/10 bg-paper/45 px-5 py-5 sm:grid-cols-2 sm:px-6">
          {reading.focusAreas.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-ink">可留意</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-moss">
                {reading.focusAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {reading.cautions.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-ink">分寸</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-moss">
                {reading.cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function BaziMasterPage() {
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("bazi:chart");

    if (!raw) {
      setMissing(true);
      return;
    }

    const parsed = JSON.parse(raw) as BaziChart;
    setChart(parsed);
    setMissing(!hasSecondaryInfo(parsed.input));
  }, []);

  const reading = useMemo(() => (chart ? generatePreviewFortuneReading(chart) : null), [chart]);
  const secondaryInfo = useMemo(() => (chart ? infoItems(chart.input) : []), [chart]);

  if (!chart || missing) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="max-w-md rounded-lg border border-ink/10 bg-white/85 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">{missing ? "暂无问诊资料" : "没有找到命盘"}</h1>
          <p className="mt-3 leading-7 text-moss">
            {missing ? "请先在排盘页填写问题或辅助信息，再请先生细看。" : "请先完成八字排盘，再进入先生解读。"}
          </p>
          <Link
            href="/bazi"
            className="mt-6 inline-flex rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade"
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
    .join(" / ");

  return (
    <main className="min-h-screen bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between py-2">
          <Link
            href="/bazi/result"
            className="rounded-md border border-ink/15 bg-white/70 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
          >
            返回命盘
          </Link>
          <Link
            href="/bazi"
            className="rounded-md border border-ink/15 bg-white/70 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
          >
            重新填写
          </Link>
        </nav>

        <header className="mt-5 overflow-hidden rounded-lg bg-[linear-gradient(150deg,#1a1611,#2d261b)] px-5 py-7 shadow-[0_18px_52px_rgba(21,19,15,0.2)] sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a85d]">观命先生</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">据盘问事，一事一断</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
                日主 {chart.dayMaster}，{chart.columns.map((column) => `${column.heavenlyStem.value}${column.earthlyBranch.value}`).join(" / ")}
              </p>
            </div>
            <div className="grid gap-1 text-sm text-white/62 lg:text-right">
              <span>{chart.input.birthDate} {chart.input.birthTimeUnknown ? "时辰不详" : chart.input.birthTime}</span>
              <span>{place}</span>
              <span>{genderLabel(chart.input.gender)}</span>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">问诊资料</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">用户留下的辅助信息</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryInfo.map((item) => (
              <div key={item.label} className="rounded-md border border-ink/10 bg-paper/45 p-4">
                <p className="text-xs text-moss">{item.label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5">
          <ReadingBox reading={reading} />
        </div>
      </div>
    </main>
  );
}
