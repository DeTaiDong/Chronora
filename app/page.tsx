import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <section className="relative flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(183,91,56,0.18),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(47,125,109,0.16),transparent_30%),linear-gradient(135deg,#fbf8ef_0%,#f0eadc_42%,#e8eee8_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 border-b border-ink/10 bg-white/25 backdrop-blur-sm" />

        <nav className="mx-auto flex w-full max-w-3xl items-center py-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded border border-ink/20 bg-white/70 text-lg font-semibold shadow-sm">
              观
            </div>
            <div>
              <p className="text-base font-semibold leading-none">观石</p>
              <p className="mt-1 text-xs text-moss">Chronora · 东方术数问诊</p>
            </div>
          </div>
        </nav>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 py-16 text-center">
          <div>
            <p className="mb-6 inline-flex rounded border border-ember/25 bg-white/55 px-3 py-1 text-sm font-medium text-ember">
              Chronora
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
              观时成象，
              <span className="block text-jade">以术数照见人生纹理。</span>
            </h1>
            <p className="mt-6 text-base leading-8 text-moss">
              从出生时间切入，排四柱、观五行、推大运流年。
            </p>
          </div>

          <Link
            href="/bazi"
            className="group flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-ink/10 bg-white/75 p-8 shadow-[0_18px_45px_rgba(39,54,47,0.11)] backdrop-blur transition hover:-translate-y-1 hover:border-jade/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-jade/50"
          >
            <div className="grid h-16 w-16 place-items-center rounded-md border border-ink/10 bg-paper text-3xl font-semibold text-ink transition group-hover:border-jade/40 group-hover:text-jade">
              观
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink">八字命理</h2>
              <p className="mt-2 text-sm font-medium text-jade">四柱排盘 · 五行十神 · 大运流年</p>
            </div>
            <span className="mt-2 flex items-center text-sm font-semibold text-ink transition group-hover:text-jade">
              开始填写信息
              <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
