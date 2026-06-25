// ─── 五行局判定 ────────────────────────────────────────────────────────────
// 紫微斗数的五行局由【命宫干支的纳音五行】决定
//
// 纳音五行查法：ganzhi60Index = (6×干序 - 5×支序 + 120) % 60
// 每两个相邻序号共享同一纳音（甲子/乙丑同为海中金，以此类推）

import type { FivePhaseInfo } from "./types";

// 30组纳音五行（每组覆盖2个相邻干支序号）
const NAYIN_ELEMENTS: string[] = [
  "金","火","木","土","金","火","水","土","金","木",
  "水","土","火","木","水","金","火","木","土","金",
  "火","水","土","金","木","水","土","火","木","水",
];

const PHASE_MAP: Record<string, FivePhaseInfo> = {
  "水": { num: 2, name: "水二局", element: "水", startAge: 2 },
  "木": { num: 3, name: "木三局", element: "木", startAge: 3 },
  "金": { num: 4, name: "金四局", element: "金", startAge: 4 },
  "土": { num: 5, name: "土五局", element: "土", startAge: 5 },
  "火": { num: 6, name: "火六局", element: "火", startAge: 6 },
};

// stemIndex: 0=甲…9=癸  branchIndex: 0=子…11=亥
export function getFivePhaseInfo(
  stemIndex: number,
  branchIndex: number,
): FivePhaseInfo {
  const gz60 = ((6 * stemIndex - 5 * branchIndex) % 60 + 60) % 60;
  const element = NAYIN_ELEMENTS[Math.floor(gz60 / 2)];
  return PHASE_MAP[element]!;
}
