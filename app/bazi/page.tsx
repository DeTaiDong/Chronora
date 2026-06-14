import Link from "next/link";
import BaziIntakeForm from "./BaziIntakeForm";

export default function BaziPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fbf8ef_0%,#f2eadc_46%,#e8f0ea_100%)] px-5 py-6 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-jade/40">
            <div className="grid h-10 w-10 place-items-center rounded border border-ink/20 bg-white/70 text-lg font-semibold shadow-sm">
              观
            </div>
            <div>
              <p className="text-base font-semibold leading-none">观石 · 八字命理</p>
              <p className="mt-1 text-xs text-moss">Chronora Bazi Intake</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-md border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-jade hover:text-jade"
          >
            返回首页
          </Link>
        </nav>

        <section className="grid gap-8 py-9 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
          <aside className="rounded-lg border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur lg:sticky lg:top-8">
            <p className="mb-4 inline-flex rounded border border-ember/25 bg-white/65 px-3 py-1 text-sm font-medium text-ember">
              第一步 · 建立命盘基础
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              先收集出生信息，
              <span className="block text-jade">再进入八字推算。</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-moss">
              必要信息用于排盘，辅助信息用于让后续解释更贴近真实处境。当前会先生成结构化命盘结果页，之后再接入更完整的解读与问诊流程。
            </p>

          </aside>

          <BaziIntakeForm />
        </section>
      </div>
    </main>
  );
}
