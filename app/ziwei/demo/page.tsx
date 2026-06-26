"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ZiweiChart } from "@/lib/ziwei/types";
import { buildZiweiChart } from "@/lib/ziwei/engine";

// 示例命盘：1990年3月15日 午时（12点），北京，女
const SAMPLE_INPUT = {
  birthDate:    "1990-03-15",
  birthHour:    12,
  gender:       "female" as const,
  question:     "近年事业发展与感情运势如何？",
  careerStatus: "在外企从事设计工作，近期考虑跳槽创业",
  relationshipStatus: "单身，有意中人但未确定关系",
  education:    "本科，平面设计专业",
  familySupport: "父母支持，但希望我尽快稳定",
};

export default function ZiweiDemoPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const chart: ZiweiChart = buildZiweiChart(SAMPLE_INPUT);
      sessionStorage.setItem("ziwei:chart", JSON.stringify(chart));
    } catch (e) {
      console.error("示例命盘生成失败", e);
    }
    router.replace("/ziwei/result");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-paper">
      <p className="text-sm text-moss animate-pulse">正在加载示例命盘……</p>
    </main>
  );
}
