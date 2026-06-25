"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SHENSHA_INFO } from "@/lib/shensha-info";

const categoryStyle = {
  吉神: "bg-jade/10 text-jade border-jade/30",
  凶煞: "bg-ember/10 text-ember border-ember/30",
  其他: "bg-ink/5 text-moss border-ink/15",
};

type Props = {
  star: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function ShenShaTag({ star, className = "", style }: Props) {
  const info = SHENSHA_INFO[star];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, above: true });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setMounted(true); }, []);

  function calcPos() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popW = 292;
    const above = rect.top > 220;
    const rawLeft = rect.left + rect.width / 2 - popW / 2;
    const left = Math.max(12, Math.min(rawLeft, window.innerWidth - popW - 12));
    setPos({ top: above ? rect.top - 10 : rect.bottom + 10, left, above });
  }

  function openPop() { calcPos(); setOpen(true); }

  // Desktop hover
  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    openPop();
  }
  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  // Mobile tap toggle
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    open ? setOpen(false) : openPop();
  }

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) setOpen(false);
    }
    function onScroll() { setOpen(false); }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  // No info → plain span
  if (!info) {
    return <span className={className} style={style}>{star}</span>;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`cursor-pointer select-none ${className}`}
        style={style}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {star}
      </button>

      {mounted && open && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`${star} 介绍`}
          className="fixed z-[9999] w-[292px] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_40px_rgba(27,22,15,0.18)]"
          style={{
            top: pos.above ? pos.top : pos.top,
            left: pos.left,
            transform: pos.above ? "translateY(-100%)" : "translateY(0)",
            animation: "tooltipIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
          onPointerEnter={() => clearTimeout(closeTimer.current)}
          onPointerLeave={handlePointerLeave}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-ink/8 bg-paper/60 px-4 py-3">
            <span className="text-base font-semibold text-ink">{star}</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${categoryStyle[info.category]}`}>
              {info.category}
            </span>
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <p className="text-sm leading-6 text-moss">{info.summary}</p>

            <ul className="mt-3 space-y-1.5">
              {info.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-5 text-ink/70">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
