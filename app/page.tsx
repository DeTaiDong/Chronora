import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";

const featureTags = ["四柱精确排盘", "五行十神分析", "神煞分布速览", "AI 先生据盘解读"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden text-ink">
      <section className="relative flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(138,106,53,0.10),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(111,127,79,0.08),transparent_32%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 border-b border-ink/10 bg-white/25 backdrop-blur-sm" />

        {/* 缓慢旋转的八卦水印 */}
        <div className="pointer-events-none absolute -bottom-20 -right-20 -z-10 h-[500px] w-[500px] opacity-[0.045] sm:h-[620px] sm:w-[620px] animate-[spin_80s_linear_infinite]">
          <Image
            src="/bagua-loading.svg"
            alt=""
            fill
            sizes="620px"
            className="object-contain mix-blend-multiply"
          />
        </div>

        <SiteNav showRefill={false} />

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 py-14 text-center">

          {/* Hero 文字 — 墨晕揭开 */}
          <div>
            <div className="opacity-0 animate-ink-reveal">
              <h1 className="font-zh-title text-5xl leading-snug text-ink sm:text-6xl lg:text-7xl">
                观时成象，
                <span className="block text-jade">以术数照见人生纹理。</span>
              </h1>
              <p className="mt-6 text-base leading-8 text-moss">
                从出生时间切入，排四柱、观五行、看十神神煞，再把命盘整理成更易读的问诊体验。
              </p>
            </div>

            {/* 功能标签 — 逐个弹入 */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {featureTags.map((tag, i) => (
                <span
                  key={tag}
                  className="opacity-0 animate-fade-up rounded-full border border-[rgba(138,106,53,0.22)] bg-[rgba(255,250,241,0.65)] px-3.5 py-1.5 text-xs font-medium text-moss backdrop-blur-sm"
                  style={{ animationDelay: `${280 + i * 70}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA 卡片 — 延迟淡入 */}
          <Link
            href="/bazi"
            className="opacity-0 animate-fade-up group flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border border-[rgba(138,106,53,0.18)] bg-[rgba(255,250,241,0.72)] px-6 py-7 shadow-[0_16px_40px_rgba(86,62,30,0.08)] backdrop-blur-[8px] transition hover:-translate-y-1 hover:bg-[rgba(255,250,241,0.88)] focus:outline-none focus:ring-2 focus:ring-gold-light/40"
            style={{ animationDelay: "570ms" }}
          >
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold/40 font-zh-title text-2xl text-gold-dark transition group-hover:border-gold group-hover:text-gold">
              观
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-ink">八字命理</h2>
              <p className="mt-1.5 text-sm font-medium text-gold">四柱排盘 / 五行十神 / 先生解读</p>
            </div>
            <span className="mt-1 flex items-center text-sm font-semibold text-ink/70 transition group-hover:text-gold-dark">
              开始填写信息
              <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </span>
            <p className="text-xs text-moss/55">约 3 分钟 · 完全免费</p>
          </Link>

          {/* 页脚 — 最后浮现 */}
          <footer
            className="opacity-0 animate-fade-up flex flex-col items-center gap-3"
            style={{ animationDelay: "760ms" }}
          >
            <Link
              href="/bazi/demo"
              className="text-sm text-moss/60 underline decoration-moss/20 underline-offset-4 transition hover:text-jade hover:decoration-jade/40"
            >
              查看示例命盘 →
            </Link>
            <div className="max-w-2xl text-xs leading-6 text-moss/60">
              <p>玄学内容仅供娱乐与文化参考，不构成现实决策建议。© Chronora.</p>
              <p className="mt-1">
                欢迎指正与共建：
                <Link
                  href="https://github.com/DeTaiDong/Chronora"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition hover:text-jade"
                >
                  DeTaiDong/Chronora
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
