import ZiweiIntakeForm from "./ZiweiIntakeForm";
import SiteNav from "@/components/SiteNav";

export default function ZiweiPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <SiteNav />

        <section className="grid gap-8 py-9 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
          <aside className="rounded-lg border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur lg:sticky lg:top-28">
            <p
              className="mb-4 inline-flex rounded border border-[rgba(111,127,79,0.3)] bg-white/65 px-3 py-1 text-sm font-medium text-jade opacity-0 animate-fade-up"
            >
              第一步 / 建立紫微命盘
            </p>
            <h1
              className="text-4xl font-semibold leading-tight sm:text-5xl opacity-0 animate-ink-reveal"
              style={{ animationDelay: "120ms" }}
            >
              录入出生信息，
              <span className="block text-jade">推演十二宫位。</span>
            </h1>
            <p
              className="mt-5 text-base leading-8 text-moss opacity-0 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              紫微斗数以农历生辰为基准，时辰精确度影响命宫与大运起点。性别决定大运顺逆，请如实填写。
            </p>
            <div
              className="mt-6 grid gap-3 opacity-0 animate-fade-up"
              style={{ animationDelay: "420ms" }}
            >
              {[
                ["十二宫位", "命宫、身宫与各宫主题同屏展示"],
                ["主辅星曜", "紫微、天府系与辅星四化分层呈现"],
                ["资料复用", "可直接调用八字已保存的基础信息"]
              ].map(([title, desc]) => (
                <div key={title} className="rounded-md border border-ink/10 bg-white/55 px-3 py-3">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-moss">{desc}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <ZiweiIntakeForm />
          </div>
        </section>
      </div>
    </main>
  );
}
