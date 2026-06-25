"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ZiweiChart } from "@/lib/ziwei/types";
import type { ZiweiMasterResponse } from "@/lib/ziwei-master/schema";
import { hasSecondaryInfo } from "@/lib/ziwei-master/guard";
import SiteNav from "@/components/SiteNav";

type InfoItem = { label: string; value?: string };

function infoItems(input: ZiweiChart["input"]): InfoItem[] {
  return [
    { label: "所问主题",   value: input.question },
    { label: "学历/学习",  value: input.education },
    { label: "事业状态",   value: input.careerStatus },
    { label: "感情状态",   value: input.relationshipStatus },
    { label: "恋爱经历",   value: input.romanceHistory },
    { label: "家庭支持",   value: input.familySupport },
    { label: "重要经历",   value: input.lifeEvents?.filter(Boolean).join("、") },
  ].filter((i) => i.value?.trim());
}

function ReadingBox({ reading }: { reading: ZiweiMasterResponse | null }) {
  if (!reading) {
    return (
      <section className="opacity-0 animate-fade-up rounded-lg border border-ink/10 bg-white/80 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">先生未开口</p>
        <p className="mt-3 text-sm leading-7 text-moss">用户未留下明确问题，依照规则不作空泛推断。</p>
      </section>
    );
  }

  return (
    <section className="opacity-0 animate-fade-up rounded-lg border border-ink/10 bg-white/85 shadow-sm">
      <div className="border-b border-ink/10 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">
          {reading.isRefusal ? "不入命盘" : "先生批语"}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">{reading.title}</h2>
      </div>

      <div className="min-h-[360px] space-y-5 px-5 py-5 sm:px-6">
        {reading.answer.split(/\n\n+/).filter(Boolean).map((para, i) => (
          <p
            key={i}
            className="answer-para font-zh-reading text-[1.05rem] leading-9 text-ink"
            style={{ animationDelay: `${i * 180}ms` }}
          >
            {para.trim()}
          </p>
        ))}
      </div>

      {(reading.focusAreas.length > 0 || reading.cautions.length > 0) && (
        <div className="grid gap-4 border-t border-ink/10 bg-paper/45 px-5 py-5 sm:grid-cols-2 sm:px-6">
          {reading.focusAreas.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink">可留意</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-moss">
                {reading.focusAreas.map((item, i) => (
                  <li key={item} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80 + 200}ms` }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {reading.cautions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink">分寸</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-moss">
                {reading.cautions.map((item, i) => (
                  <li key={item} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80 + 200}ms` }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ZiweiMasterPage() {
  const [chart,   setChart]   = useState<ZiweiChart | null>(null);
  const [missing, setMissing] = useState(false);
  const [reading, setReading] = useState<ZiweiMasterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError,  setApiError]  = useState<string | null>(null);
  const [apiDetail, setApiDetail] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ziwei:chart");
    if (!raw) { setMissing(true); return; }
    const parsed = JSON.parse(raw) as ZiweiChart;
    setChart(parsed);
    setMissing(!hasSecondaryInfo(parsed.input));
  }, []);

  useEffect(() => {
    if (!chart) return;

    const fp = JSON.stringify(chart.input);
    if (sessionStorage.getItem("ziwei:reading:fp") === fp) {
      const cached = sessionStorage.getItem("ziwei:reading");
      if (cached) { try { setReading(JSON.parse(cached)); return; } catch { /* corrupt */ } }
    }

    setLoading(true);
    setApiError(null);

    fetch("/api/ziwei-master/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(chart),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setApiError(
            typeof data?.error === "string" ? data.error :
            data?.error?.message ?? `请求失败（HTTP ${res.status}）`
          );
          setApiDetail(data?.error?.detail ?? null);
          return null;
        }
        return data as ZiweiMasterResponse | null;
      })
      .then((data) => {
        if (!data) return;
        setReading(data);
        sessionStorage.setItem("ziwei:reading", JSON.stringify(data));
        sessionStorage.setItem("ziwei:reading:fp", JSON.stringify(chart.input));
      })
      .catch((err) => {
        setApiError("无法连接 AI 解读接口，请检查网络或开发服务器。");
        setApiDetail(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [chart]);

  const secondaryInfo = useMemo(() => (chart ? infoItems(chart.input) : []), [chart]);

  if (!chart || missing) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="max-w-md rounded-lg border border-ink/10 bg-white/85 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">{missing ? "暂无问诊资料" : "没有找到命盘"}</h1>
          <p className="mt-3 leading-7 text-moss">
            {missing ? "请先填写问题或辅助信息，再请先生细看。" : "请先完成紫微排盘，再进入先生解读。"}
          </p>
          <Link href="/ziwei" className="mt-6 inline-flex rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade">
            返回填写
          </Link>
        </section>
      </main>
    );
  }

  const destinyPalace = chart.palaces[chart.destinyPalaceIndex];

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SiteNav />

        {/* 暗色头部 */}
        <header className="relative mt-5 overflow-hidden rounded-lg bg-[linear-gradient(150deg,#1a1611,#2d261b)] px-5 py-7 shadow-[0_18px_52px_rgba(21,19,15,0.2)] sm:px-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(201,168,93,0.22),transparent_60%)] animate-header-glow" />

          <p className="relative text-xs font-semibold uppercase tracking-widest text-[#c9a85d] opacity-0 animate-ink-reveal">
            观命先生 · 紫微
          </p>
          <div className="relative mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold text-white sm:text-4xl opacity-0 animate-ink-reveal"
                style={{ animationDelay: "80ms" }}
              >
                据盘问事，一事一断
              </h1>
              <p
                className="mt-3 text-sm leading-7 text-white/70 opacity-0 animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                {chart.fivePhase.name} · 命宫 {destinyPalace.stem}{destinyPalace.branch} ·{" "}
                {destinyPalace.mainStars.map((s) => s.name).join("、") || "空宫"}
              </p>
              <Link
                href="/ziwei/result"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white opacity-0 animate-fade-up"
                style={{ animationDelay: "280ms" }}
              >
                查看命盘
              </Link>
            </div>
            <div
              className="grid gap-1 text-sm text-white/60 lg:text-right opacity-0 animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              <span>农历 {chart.lunar.yearGanZhi}年 {chart.lunar.month}月{chart.lunar.day}日</span>
              <span>{chart.input.gender === "male" ? "男" : "女"}</span>
            </div>
          </div>
        </header>

        {/* 问诊资料 */}
        <section className="mt-5 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ember">问诊资料</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">用户留下的辅助信息</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryInfo.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-ink/10 bg-paper/45 p-4"
              >
                <p className="text-xs text-moss">{item.label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 解读内容 */}
        <div className="mt-5">
          {loading ? (
            <section className="opacity-0 animate-fade-up rounded-lg border border-ink/10 bg-white/80 p-8 shadow-sm text-center">
              <p className="text-sm text-moss animate-pulse">先生正在推演，稍候片刻……</p>
            </section>
          ) : apiError ? (
            <section className="opacity-0 animate-fade-up rounded-lg border border-ink/10 bg-white/80 p-8 shadow-sm text-center">
              <p className="text-sm text-ember">{apiError}</p>
              {apiDetail && (
                <p className="mt-3 break-words rounded-md border border-ember/15 bg-ember/8 px-3 py-2 text-left text-xs leading-5 text-moss">
                  技术细节：{apiDetail}
                </p>
              )}
            </section>
          ) : (
            <ReadingBox key={reading ? "reading" : "no-reading"} reading={reading} />
          )}
        </div>
      </div>
    </main>
  );
}
