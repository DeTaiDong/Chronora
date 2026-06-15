import Link from "next/link";
import Image from "next/image";

type SiteNavProps = {
  showRefill?: boolean;
};

export default function SiteNav({ showRefill = true }: SiteNavProps) {
  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-0">
      <nav className="flex items-center justify-between gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 shadow-[0_12px_34px_rgba(23,32,29,0.12)] backdrop-blur-xl sm:px-4">
        <Link
          href="/"
          aria-label="观石 Chronora 首页"
          className="flex min-w-0 shrink items-center gap-2.5 rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-jade/40"
        >
          <Image
            src="/icon.svg"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-[10px] shadow-sm sm:h-11 sm:w-11"
          />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold leading-none text-ink">观知 Chronora</p>
            <p className="mt-1 hidden text-xs text-moss sm:block">八字排盘与问诊工具</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showRefill ? (
            <Link
              href="/bazi"
              className="whitespace-nowrap rounded-md border border-ink/15 bg-white/60 px-2.5 py-2 text-xs font-medium text-ink transition hover:border-jade hover:text-jade sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden">重填</span>
              <span className="hidden sm:inline">重新填写</span>
            </Link>
          ) : null}
          <Link
            href="/"
            className="whitespace-nowrap rounded-md border border-ink/15 bg-white/60 px-2.5 py-2 text-xs font-medium text-ink transition hover:border-jade hover:text-jade sm:px-3 sm:text-sm"
          >
            首页
          </Link>
          <Link
            href="/about"
            className="whitespace-nowrap rounded-md bg-ink px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-jade sm:px-3 sm:text-sm"
          >
            更多
          </Link>
        </div>
      </nav>
    </header>
  );
}
