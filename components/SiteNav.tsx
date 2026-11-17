import Link from "next/link";
import Image from "next/image";

type SiteNavProps = {
  showRefill?: boolean;
};

export default function SiteNav({ showRefill = false }: SiteNavProps) {
  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-0">
      <nav className="flex items-center justify-between gap-2 rounded-xl border border-ink/12 bg-[rgba(255,252,245,0.92)] px-2.5 py-2 shadow-[0_4px_22px_rgba(23,32,29,0.10),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl sm:px-4">

        {/* Logo */}
        <Link
          href="/"
          aria-label="Chronora 首页"
          className="group flex min-w-0 shrink items-center gap-2.5 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-jade/40"
        >
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-[10px] shadow-sm transition-opacity group-hover:opacity-80 sm:h-11 sm:w-11"
          />

        </Link>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showRefill && (
            <Link
              href="/bazi"
              className="whitespace-nowrap rounded-lg border border-ink/20 bg-white/80 px-3 py-1.5 text-sm font-semibold tracking-wide text-ink shadow-sm transition hover:border-jade/50 hover:text-jade sm:px-3.5"
            >
              <span className="sm:hidden">重填</span>
              <span className="hidden sm:inline">重新填写</span>
            </Link>
          )}
          <Link
            href="/"
            className="whitespace-nowrap rounded-lg border border-ink/20 bg-white/80 px-3 py-1.5 text-sm font-semibold tracking-wide text-ink shadow-sm transition hover:border-jade/50 hover:text-jade sm:px-3.5"
          >
            首页
          </Link>
          <Link
            href="/about"
            className="whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-jade sm:px-3.5"
          >
            更多
          </Link>
        </div>
      </nav>
    </header>
  );
}
