// ─── 大运推算 ──────────────────────────────────────────────────────────────
//
// 布大运规则：
//   阳年男命/阴年女命 → 顺数（+1宫）
//   阴年男命/阳年女命 → 逆数（-1宫）
//   阳年：年干为甲丙戊庚壬（stemIndex 偶数）
//
// 大运干支：从命宫干支开始，顺/逆推各大运

import { STEMS, BRANCHES, getPalaceGanZhi } from "./calendar";
import type { DaYun } from "./types";
import { getPalaceName } from "./palaces";

export function buildDaYun(
  destinyPalaceIndex: number,   // 命宫地支 index 0-11
  destinyPalaceStemIndex: number, // 命宫天干 index 0-9
  yearStemIndex: number,
  gender: "male" | "female",
  fivePhaseStartAge: number,    // 五行局起运年龄
  count = 8,                    // 排几步大运
): DaYun[] {
  const isYangYear = yearStemIndex % 2 === 0; // 甲丙戊庚壬为阳
  const isForward  = (isYangYear && gender === "male") ||
                     (!isYangYear && gender === "female");
  const dir = isForward ? 1 : -1;

  return Array.from({ length: count }, (_, i) => {
    const step        = i + 1;
    const branchIdx   = ((destinyPalaceIndex    + dir * step) % 12 + 12) % 12;
    const stemIdx     = ((destinyPalaceStemIndex + dir * step) % 10 + 10) % 10;
    const startAge    = fivePhaseStartAge + i * 10;

    return {
      index:      i,
      startAge,
      endAge:     startAge + 9,
      branch:     BRANCHES[branchIdx],
      stem:       STEMS[stemIdx],
      palaceName: getPalaceName(branchIdx, destinyPalaceIndex),
    };
  });
}
