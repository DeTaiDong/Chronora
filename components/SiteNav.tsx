import Link from "next/link";

type SiteNavProps = {
  showRefill?: boolean;
};

export default function SiteNav({ showRefill = true }: SiteNavProps) {
  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-0">
      <nav className="flex items-center justify-between rounded-lg border border-white/60 bg-white/62 px-3 py-2 shadow-[0_12px_34px_rgba(23,32,29,0.12)] backdrop-blur-xl sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-jade/40"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded border border-ink/20 bg-white/75 text-base font-semibold shadow-sm">
            观
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-none text-ink">观知 Chronora</p>
            <p className="mt-1 hidden text-xs text-moss sm:block">八字排盘与问诊实验</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {showRefill ? (
            <Link
              href="/bazi"
              className="rounded-md border border-ink/15 bg-white/58 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
            >
              重新填写
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-md border border-ink/15 bg-white/58 px-3 py-2 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
          >
            首页
          </Link>
          <Link
            href="/about"
            className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-jade"
          >
            更多
          </Link>
        </div>
      </nav>
    </header>
  );
}
