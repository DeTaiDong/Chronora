"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ZIWEI_STAR_INFO } from "@/lib/ziwei-star-info";
import type { StarEntry } from "@/lib/ziwei/types";

const categoryStyle = {
  紫微系: "bg-gold/10 text-gold-dark border-gold/30",
  天府系: "bg-jade/10 text-jade border-jade/30",
  吉辅: "bg-[#5577aa]/10 text-[#5577aa] border-[#5577aa]/25",
  煞忌: "bg-ember/10 text-ember border-ember/30",
  杂曜: "bg-ink/5 text-moss border-ink/15"
};

const transformStyle = {
  化禄: "border-[#5f7f4f]/25 bg-[#5f7f4f]/10 text-[#5f7f4f]",
  化权: "border-[#9a6a2f]/25 bg-[#9a6a2f]/10 text-[#9a6a2f]",
  化科: "border-[#4f6f8f]/25 bg-[#4f6f8f]/10 text-[#4f6f8f]",
  化忌: "border-[#9b4a3f]/25 bg-[#9b4a3f]/10 text-[#9b4a3f]"
};

type Props = {
  star: StarEntry;
  isMain: boolean;
  variant?: "main" | "aux" | "minor";
};

export default function ZiweiStarTag({ star, isMain, variant = isMain ? "main" : "aux" }: Props) {
  const info = ZIWEI_STAR_INFO[star.name];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, above: true });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => setMounted(true), []);

  function calcPos() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popW = 320;
    const above = rect.top > 230;
    const rawLeft = rect.left + rect.width / 2 - popW / 2;
    const left = Math.max(12, Math.min(rawLeft, window.innerWidth - popW - 12));
    setPos({ top: above ? rect.top - 10 : rect.bottom + 10, left, above });
  }

  function openPop() {
    calcPos();
    setOpen(true);
  }

  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    openPop();
  }

  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    open ? setOpen(false) : openPop();
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const base =
    variant === "main"
      ? "relative inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 py-1.5 pr-4 text-[17px] font-bold leading-none"
      : variant === "aux"
        ? "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[13px] font-semibold leading-none"
        : "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-none opacity-75";

  const color = variant === "main"
    ? info?.category === "天府系"
      ? "border border-jade/30 bg-jade/10 text-jade shadow-sm"
      : "border border-gold/30 bg-gold/10 text-gold-dark shadow-sm"
    : variant === "aux"
      ? "border border-ink/12 bg-white/65 text-ink/75"
      : "border border-ink/8 bg-ink/5 text-moss";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${base} ${color} cursor-pointer transition hover:-translate-y-0.5 hover:shadow-sm`}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {star.name}
        {star.transform ? (
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none ${
              transformStyle[star.transform] ?? ""
            } ${variant === "main" ? "-mr-1 -mt-4 self-start" : ""}`}
          >
            {star.transform}
          </span>
        ) : null}
      </button>

      {mounted && open && info
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={`${star.name} 介绍`}
              className="fixed z-[9999] w-[320px] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_40px_rgba(27,22,15,0.18)]"
              style={{
                top: pos.top,
                left: pos.left,
                transform: pos.above ? "translateY(-100%)" : "translateY(0)",
                animation: "tooltipIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards"
              }}
              onPointerEnter={() => clearTimeout(closeTimer.current)}
              onPointerLeave={handlePointerLeave}
            >
              <div className="flex items-center justify-between gap-3 border-b border-ink/8 bg-paper/60 px-4 py-3">
                <div>
                  <p className="text-base font-semibold text-ink">{star.name}</p>
                  <p className="mt-0.5 text-xs text-moss">五行：{info.element}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${categoryStyle[info.category]}`}>
                  {info.category}
                </span>
              </div>

              <div className="px-4 py-3">
                <p className="text-sm leading-6 text-moss">{info.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {info.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-5 text-ink/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
