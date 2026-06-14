"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BaziLoadingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("校验出生信息");

  useEffect(() => {
    let cancelled = false;

    async function createChart() {
      const raw = sessionStorage.getItem("bazi:intake");

      if (!raw) {
        router.replace("/bazi");
        return;
      }

      try {
        setMessage("推演四柱干支");
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
        setMessage("整理十神神煞");
        sessionStorage.setItem("bazi:chart", JSON.stringify(data));
        window.setTimeout(() => router.replace("/bazi/result"), 900);
      } catch (error) {
        if (cancelled) return;
        sessionStorage.setItem("bazi:error", error instanceof Error ? error.message : "排盘失败，请返回重试。");
        router.replace("/bazi/result");
      }
    }

    createChart();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f0e4] px-5 text-[#1b1712]">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto grid h-80 w-80 place-items-center rounded-full border border-[#c8b98f] bg-[#fffdf7] shadow-[0_26px_80px_rgba(55,42,22,0.18)] sm:h-[28rem] sm:w-[28rem]">
          <div className="relative h-72 w-72 animate-[spin_10s_linear_infinite] overflow-hidden rounded-full sm:h-96 sm:w-96">
            <Image
              src="/bagua-loading.png"
              alt="旋转八卦排盘图"
              fill
              priority
              sizes="(min-width: 640px) 384px, 288px"
              className="object-contain"
            />
          </div>
        </div>

        <p className="mt-8 text-sm font-semibold text-[#a32218]">太极生两仪 · 两仪生四象 · 四象定八卦</p>
        <h1 className="mt-2 text-3xl font-semibold">正在为你起盘</h1>
        <p className="mt-4 text-base leading-7 text-[#6f654f]">{message}，请稍候。</p>
      </section>
    </main>
  );
}
