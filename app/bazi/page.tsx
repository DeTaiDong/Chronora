import BaziIntakeForm from "./BaziIntakeForm";
import SiteNav from "@/components/SiteNav";

export default function BaziPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <SiteNav />

        <section className="grid gap-8 py-9 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
          <aside className="rounded-lg border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur lg:sticky lg:top-28">
            <p className="mb-4 inline-flex rounded border border-ember/25 bg-white/65 px-3 py-1 text-sm font-medium text-ember">
              第一步 / 建立命盘基础
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              先收集出生信息，
              <span className="block text-jade">再进入八字推算。</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-moss">
              必要信息用于排盘，辅助信息用于让后续解读更贴近真实处境。当前会先生成结构化命盘结果页，之后再进入先生解读。
            </p>
          </aside>

          <BaziIntakeForm />
        </section>
      </div>
    </main>
  );
}
