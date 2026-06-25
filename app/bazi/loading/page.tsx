"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BaziLoadingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("校验出生信息");
  const [msgVisible, setMsgVisible] = useState(true);

  function fadeToMessage(msg: string) {
    setMsgVisible(false);
    setTimeout(() => {
      setMessage(msg);
      setMsgVisible(true);
    }, 200);
  }

  useEffect(() => {
    let cancelled = false;

    async function createChart() {
      const raw = sessionStorage.getItem("bazi:intake");

      if (!raw) {
        router.replace("/bazi");
        return;
      }

      try {
        fadeToMessage("推演四柱干支");
        const response = await fetch("/api/bazi/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw
        });
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "排盘失败");
        }

        if (cancelled) return;
        fadeToMessage("整理十神神煞");
        sessionStorage.setItem("bazi:chart", JSON.stringify(data));
        sessionStorage.removeItem("bazi:reading");
        sessionStorage.removeItem("bazi:reading:fp");
        window.setTimeout(() => router.replace("/bazi/result"), 900);
      } catch (error) {
        if (cancelled) return;
        sessionStorage.setItem(
          "bazi:error",
          error instanceof Error ? error.message : "排盘失败，请返回重试。"
        );
        router.replace("/bazi/result");
      }
    }

    createChart();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-5 text-[#1b1712]">
      <section className="w-full max-w-xl text-center">
        <div className="relative mx-auto h-80 w-80 sm:h-[28rem] sm:w-[28rem]">
          {/* Outer breathing aura */}
          <div className="absolute -inset-1 rounded-full border border-[#c8b98f]/30 animate-pulse" />
          {/* Counter-rotating dashed ring */}
          <div
            className="absolute inset-4 rounded-full border border-dashed border-[#c8b98f]/40 animate-spin"
            style={{ animationDuration: "22s", animationDirection: "reverse" }}
          />
          {/* Main circle container */}
          <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-full border border-[#c8b98f] bg-[#fffdf7] shadow-[0_26px_80px_rgba(55,42,22,0.18)]">
            {/* Spinning bagua */}
            <div className="relative aspect-square w-[85%] animate-[spin_10s_linear_infinite]">
              <Image
                src="/bagua-loading.svg"
                alt="旋转八卦排盘图"
                fill
                priority
                sizes="(min-width: 640px) 381px, 272px"
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm font-semibold text-[#a32218]">
          太极生两仪 · 两仪生四象 · 四象定八卦
        </p>
        <h1 className="mt-2 text-3xl font-semibold">正在为你起盘</h1>
        <p
          className="mt-4 text-base leading-7 text-[#6f654f] transition-opacity duration-200"
          style={{ opacity: msgVisible ? 1 : 0 }}
        >
          {message}，请稍候。
        </p>
      </section>
    </main>
  );
}
