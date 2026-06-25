"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BaziChart } from "@/app/bazi/chartEngine";

const SAMPLE_CHART: BaziChart = {
  input: {
    birthDate: "1990-03-15",
    birthTime: "10:30",
    birthCountry: "中国",
    birthState: "北京市",
    birthCity: "北京市",
    birthPlaceDetail: "北京, 中国",
    gender: "female",
    question: "想了解今年事业发展方向，是否适合换环境或加大投入。",
    education: "硕士在读",
    careerStatus: "学生",
    relationshipStatus: "恋爱中",
    romanceHistory: "2-3段",
    familySupport: "主要靠自己",
    lifeEvents: ["出国留学"],
    adjustedBirthDate: "1990-03-15",
    adjustedBirthTime: "10:22",
    trueSolarOffsetMinutes: -8,
    taiYuan: "庚午",
    taiYuanNaYin: "路旁土",
    mingGong: "壬戌",
    mingGongNaYin: "大海水",
    shenGong: "辛酉",
    shenGongNaYin: "石榴木"
  },
  dayMaster: "壬",
  columns: [
    {
      label: "年柱",
      mainStar: "偏印",
      heavenlyStem: { value: "庚", element: "金", emoji: "⚔️" },
      earthlyBranch: { value: "午", element: "火", emoji: "🔥" },
      hiddenStems: [
        { stem: "丁", element: "火", tenGod: "正财" },
        { stem: "己", element: "土", tenGod: "正官" }
      ],
      minorStars: [],
      lifeStage: "长生",
      selfSeat: "旺",
      voidBranches: "申酉",
      nayin: "路旁土",
      symbolicStars: ["天乙贵人", "将星"]
    },
    {
      label: "月柱",
      mainStar: "正财",
      heavenlyStem: { value: "丁", element: "火", emoji: "🔥" },
      earthlyBranch: { value: "卯", element: "木", emoji: "🌿" },
      hiddenStems: [
        { stem: "甲", element: "木", tenGod: "食神" }
      ],
      minorStars: [],
      lifeStage: "沐浴",
      selfSeat: "相",
      voidBranches: "申酉",
      nayin: "炉中火",
      symbolicStars: ["文昌贵人"]
    },
    {
      label: "日柱",
      mainStar: "日主",
      heavenlyStem: { value: "壬", element: "水", emoji: "💧" },
      earthlyBranch: { value: "寅", element: "木", emoji: "🌿" },
      hiddenStems: [
        { stem: "甲", element: "木", tenGod: "食神" },
        { stem: "丙", element: "火", tenGod: "偏财" },
        { stem: "戊", element: "土", tenGod: "七杀" }
      ],
      minorStars: [],
      lifeStage: "病",
      selfSeat: "囚",
      voidBranches: "申酉",
      nayin: "金箔金",
      symbolicStars: ["红鸾"]
    },
    {
      label: "时柱",
      mainStar: "偏财",
      heavenlyStem: { value: "丙", element: "火", emoji: "🔥" },
      earthlyBranch: { value: "午", element: "火", emoji: "🔥" },
      hiddenStems: [
        { stem: "丁", element: "火", tenGod: "正财" },
        { stem: "己", element: "土", tenGod: "正官" }
      ],
      minorStars: [],
      lifeStage: "胎",
      selfSeat: "休",
      voidBranches: "申酉",
      nayin: "天河水",
      symbolicStars: ["劫煞"]
    }
  ],
  fiveElements: { 木: 3, 火: 4, 土: 2, 金: 1, 水: 1 },
  summary: {
    strongestElement: "火",
    weakestElement: "水",
    note: "八字火木旺盛，水弱身弱，宜得水木相助。"
  }
};

export default function BaziDemoPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("bazi:chart", JSON.stringify(SAMPLE_CHART));
    sessionStorage.removeItem("bazi:reading");
    sessionStorage.removeItem("bazi:reading:fp");
    sessionStorage.removeItem("bazi:error");
    router.replace("/bazi/result");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-5 text-[#1b1712]">
      <p className="text-sm text-[#6f654f]">正在加载示例命盘…</p>
    </main>
  );
}
