import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden text-ink">
      <section className="relative flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(138,106,53,0.10),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(111,127,79,0.08),transparent_32%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 border-b border-ink/10 bg-white/25 backdrop-blur-sm" />

        <SiteNav showRefill={false} />

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 py-14 text-center">
          <div>
            <h1 className="font-zh-title text-5xl leading-snug text-ink sm:text-6xl lg:text-7xl">
              观时成象，
              <span className="block text-jade">以术数照见人生纹理。</span>
            </h1>
            <p className="mt-6 text-base leading-8 text-moss">
              从出生时间切入，排四柱、观五行、看十神神煞，再把命盘整理成更易读的问诊体验。
            </p>
          </div>

          <Link
            href="/bazi"
            className="group flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border border-[rgba(138,106,53,0.18)] bg-[rgba(255,250,241,0.72)] px-6 py-7 shadow-[0_16px_40px_rgba(86,62,30,0.08)] backdrop-blur-[8px] transition hover:-translate-y-1 hover:bg-[rgba(255,250,241,0.88)] focus:outline-none focus:ring-2 focus:ring-gold-light/40"
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
          </Link>

          <footer className="max-w-2xl text-xs leading-6 text-moss/78">
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
          </footer>
        </div>
      </section>
    </main>
  );
}
