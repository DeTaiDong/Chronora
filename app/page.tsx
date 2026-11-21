import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import HomeProfilePanel from "@/components/HomeProfilePanel";

const HOW_IT_WORKS = [
  { num: "①", title: "填写生辰", sub: "公历日期 · 出生时辰 · 性别" },
  { num: "②", title: "生成命盘", sub: "四柱 / 紫微十二宫自动推算" },
  { num: "③", title: "AI 解读", sub: "结合所问，给出针对性分析" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden text-ink">
      <section className="relative flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12">

        {/* ── 背景氛围层 ──────────────────────────────────────────── */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_15%,rgba(138,106,53,0.10),transparent_38%),radial-gradient(ellipse_at_85%_12%,rgba(111,127,79,0.08),transparent_36%),radial-gradient(ellipse_at_50%_90%,rgba(111,127,79,0.05),transparent_42%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 border-b border-ink/8 bg-white/22 backdrop-blur-sm" />

        {/* 八卦水印 — 右下顺转 */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[520px] w-[520px] opacity-[0.040] animate-[spin_80s_linear_infinite] sm:h-[640px] sm:w-[640px]">
          <Image src="/bagua-loading.svg" alt="" fill sizes="640px" className="object-contain mix-blend-multiply" />
        </div>
        {/* 八卦水印 — 左上逆转，更淡 */}
        <div className="pointer-events-none absolute -left-36 -top-36 -z-10 h-[360px] w-[360px] opacity-[0.020] animate-[spin_120s_linear_infinite_reverse]">
          <Image src="/bagua-loading.svg" alt="" fill sizes="360px" className="object-contain mix-blend-multiply" />
        </div>

        <SiteNav showRefill={false} />

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 py-10 text-center">

          {/* ── Hero ────────────────────────────────────────────────── */}
          <div>
            <div className="opacity-0 animate-ink-reveal">
              <h1 className="font-zh-title text-5xl leading-snug text-ink sm:text-6xl lg:text-7xl">
                观时成象，
                <span className="block text-jade">以术数照见人生纹理。</span>
              </h1>
              <p className="mt-5 text-base leading-7 text-moss">
                输入生辰，AI 为你生成八字命盘或紫微斗数并据盘解读。
              </p>
              <p className="mt-2 text-sm text-moss/55">
                出生时间 · 四柱推算 · 五行格局 · 十神神煞 · 针对性解读
              </p>
            </div>

          </div>

          {/* ── 回访用户：档案面板（有档案才渲染，在 CTA 上方） ─── */}
          <HomeProfilePanel />

          {/* ── 双入口卡片 ──────────────────────────────────────────── */}
          <div
            className="flex w-full max-w-xl flex-col gap-4 opacity-0 animate-fade-up sm:flex-row"
            style={{ animationDelay: "660ms" }}
          >
            {/* 八字命理 — 金/琥珀调 */}
            <Link
              href="/bazi"
              className="group flex flex-1 flex-col items-center gap-3 rounded-3xl border border-[rgba(138,106,53,0.22)] bg-[rgba(255,250,241,0.80)] px-6 py-7 shadow-[0_14px_38px_rgba(86,62,30,0.09)] backdrop-blur-[8px] transition hover:-translate-y-1 hover:bg-[rgba(255,250,241,0.92)] hover:shadow-[0_20px_48px_rgba(86,62,30,0.14)] focus:outline-none focus:ring-2 focus:ring-gold-light/40"
            >
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold/45 font-zh-title text-2xl text-gold-dark transition group-hover:border-gold group-hover:shadow-[0_0_0_4px_rgba(201,168,93,0.12)]">
                观
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-ink">八字命理</h2>
                <p className="mt-1.5 text-xs font-medium text-gold-dark/75">日主 · 五行 · 神煞 · 流年解读</p>
              </div>
              <span className="mt-0.5 flex items-center text-sm font-semibold text-ink/60 transition group-hover:text-gold-dark">
                开始填写信息
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <p className="text-xs text-moss/50">约 3 分钟 · 完全免费</p>
            </Link>

            {/* 紫微斗数 — 翠/青调，视觉区分 */}
            <Link
              href="/ziwei"
              className="group flex flex-1 flex-col items-center gap-3 rounded-3xl border border-[rgba(79,120,90,0.22)] bg-[rgba(241,248,244,0.80)] px-6 py-7 shadow-[0_14px_38px_rgba(39,80,54,0.08)] backdrop-blur-[8px] transition hover:-translate-y-1 hover:bg-[rgba(241,248,244,0.92)] hover:shadow-[0_20px_48px_rgba(39,80,54,0.12)] focus:outline-none focus:ring-2 focus:ring-jade/30"
            >
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-jade/45 font-zh-title text-2xl text-jade transition group-hover:border-jade group-hover:shadow-[0_0_0_4px_rgba(79,120,90,0.12)]">
                紫
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-ink">紫微斗数</h2>
                <p className="mt-1.5 text-xs font-medium text-jade/75">十二宫 · 主星 · 大运走向</p>
              </div>
              <span className="mt-0.5 flex items-center text-sm font-semibold text-ink/60 transition group-hover:text-jade">
                开始排紫微盘
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <p className="text-xs text-moss/50">农历生辰 · 时辰 · 性别</p>
            </Link>
          </div>

          {/* ── 使用流程（How it works）────────────────────────────── */}
          <div
            className="w-full max-w-xl opacity-0 animate-fade-up"
            style={{ animationDelay: "780ms" }}
          >
            <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white/42 backdrop-blur-sm">
              <p className="border-b border-ink/6 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-moss/50">
                使用流程
              </p>
              <div className="grid grid-cols-3 divide-x divide-ink/6 px-2 py-4">
                {HOW_IT_WORKS.map(({ num, title, sub }) => (
                  <div key={num} className="px-3 text-center">
                    <p className="font-zh-title text-xl text-gold-dark">{num}</p>
                    <p className="mt-1.5 text-[13px] font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-moss/60">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 示例命盘 — 更明显的入口 ────────────────────────────── */}
          <div
            className="w-full max-w-xl opacity-0 animate-fade-up"
            style={{ animationDelay: "880ms" }}
          >
            <Link
              href="/bazi/demo"
              className="group flex items-center justify-between rounded-2xl border border-ink/10 bg-white/48 px-5 py-4 backdrop-blur-sm transition hover:border-jade/30 hover:bg-white/62"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/12 bg-white/65 font-zh-title text-base text-moss/60 shadow-sm">
                  盘
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">查看示例命盘</p>
                  <p className="mt-0.5 text-xs text-moss/55">先看看命盘与解读长什么样，再决定是否填写</p>
                </div>
              </div>
              <span className="shrink-0 text-sm text-moss/45 transition group-hover:translate-x-0.5 group-hover:text-jade">→</span>
            </Link>
          </div>

          {/* ── 页脚 ────────────────────────────────────────────────── */}
          <footer
            className="flex flex-col items-center gap-2 pb-2 opacity-0 animate-fade-up"
            style={{ animationDelay: "960ms" }}
          >
            <Link
              href="https://github.com/DeTaiDong/Chronora"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-moss/55 underline decoration-moss/20 underline-offset-4 transition hover:text-jade hover:decoration-jade/40"
            >
              DeTaiDong/Chronora on GitHub →
            </Link>
            <p className="max-w-xs text-center text-xs leading-6 text-moss/40">
              玄学内容仅供娱乐与文化参考，不构成现实决策建议。© Chronora.
            </p>
          </footer>

        </div>
      </section>
    </main>
  );
}
