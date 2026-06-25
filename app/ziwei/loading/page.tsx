"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MESSAGES = [
  "正在安星布宫……",
  "推算命宫与身宫……",
  "排布十四主星……",
  "安置辅星煞曜……",
  "推演大运流年……",
  "命盘已成，稍候……",
];

export default function ZiweiLoadingPage() {
  const router              = useRouter();
  const [msg, setMsg]       = useState(MESSAGES[0]);
  const [msgVisible, setMsgVisible] = useState(true);
  const indexRef            = useRef(0);

  function fadeToMessage(next: string) {
    setMsgVisible(false);
    setTimeout(() => { setMsg(next); setMsgVisible(true); }, 200);
  }

  useEffect(() => {
    const chart = sessionStorage.getItem("ziwei:chart");
    if (chart) { router.replace("/ziwei/result"); return; }

    const iv = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % MESSAGES.length;
      fadeToMessage(MESSAGES[indexRef.current]);
    }, 1800);

    return () => clearInterval(iv);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-paper px-6">
      {/* Outer pulse aura */}
      <div className="relative grid place-items-center">
        <div className="absolute h-52 w-52 animate-pulse rounded-full bg-jade/10 sm:h-64 sm:w-64" />

        {/* Counter-rotating dashed ring */}
        <div
          className="absolute h-44 w-44 animate-spin rounded-full border-2 border-dashed border-jade/25 sm:h-56 sm:w-56"
          style={{ animationDuration: "22s", animationDirection: "reverse" }}
        />

        {/* Bagua SVG */}
        <div className="relative h-36 w-36 sm:h-44 sm:w-44">
          <Image
            src="/bagua-loading.svg"
            alt="正在排盘"
            fill
            sizes="176px"
            priority
            className="animate-spin object-contain mix-blend-multiply"
            style={{ animationDuration: "18s" }}
          />
        </div>
      </div>

      {/* Message */}
      <p
        className="font-zh-title text-xl text-moss transition-opacity duration-200 sm:text-2xl"
        style={{ opacity: msgVisible ? 1 : 0 }}
      >
        {msg}
      </p>
    </main>
  );
}
