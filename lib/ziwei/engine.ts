// ─── 紫微斗数排盘入口 ──────────────────────────────────────────────────────
// 调用所有子模块，组装完整 ZiweiChart

import { solarToLunar, hourToBranchIndex, getPalaceGanZhi, STEMS, BRANCHES } from "./calendar";
import { getDestinyPalaceIndex, getBodyPalaceIndex, getPalaceName }          from "./palaces";
import { getFivePhaseInfo }                                                    from "./five-phase";
import { getZiWeiPalaceIndex }                                                from "./stars/purple-star";
import { placeMainStars }                                                      from "./stars/main-stars";
import { placeAuxStars }                                                       from "./stars/aux-stars";
import { getFourTransforms, applyTransforms }                                  from "./stars/transforms";
import { buildDaYun }                                                          from "./cycles";
import type { ZiweiInput, ZiweiChart, Palace, StarEntry }                     from "./types";

export function buildZiweiChart(input: ZiweiInput): ZiweiChart {
  // ── Step 1: 阳历 → 农历 ────────────────────────────────────────────────
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const lunar = solarToLunar(y, m, d);

  const hourBranch = input.birthTimeUnknown ? 0 : hourToBranchIndex(input.birthHour);

  // ── Step 2: 命宫 / 身宫 ────────────────────────────────────────────────
  const destinyIdx = getDestinyPalaceIndex(lunar.month, hourBranch);
  const bodyIdx    = getBodyPalaceIndex(hourBranch);

  // ── Step 3: 命宫干支 → 五行局 ─────────────────────────────────────────
  const destGanZhi   = getPalaceGanZhi(lunar.yearStemIndex, destinyIdx);
  const destStemIdx  = STEMS.indexOf(destGanZhi.stem);
  const fivePhase    = getFivePhaseInfo(destStemIdx, destinyIdx);

  // ── Step 4: 紫微星落宫 ─────────────────────────────────────────────────
  const ziWeiIdx = getZiWeiPalaceIndex(lunar.day, fivePhase.num);

  // ── Step 5: 14主星 ────────────────────────────────────────────────────
  const mainStarMap = placeMainStars(ziWeiIdx);

  // ── Step 6: 辅星 ──────────────────────────────────────────────────────
  const auxStarMap = placeAuxStars(
    lunar.yearStemIndex,
    lunar.yearBranchIndex,
    lunar.month,
    hourBranch,
  );

  // ── Step 7: 四化 ──────────────────────────────────────────────────────
  const transforms = getFourTransforms(lunar.yearStemIndex);

  // ── Step 8: 组装 12 宫 ────────────────────────────────────────────────
  const palaces: Palace[] = Array.from({ length: 12 }, (_, idx) => {
    const gz = getPalaceGanZhi(lunar.yearStemIndex, idx);

    // 主星
    const mainStars: StarEntry[] = Object.entries(mainStarMap)
      .filter(([, pos]) => pos === idx)
      .map(([name]) => ({ name, isMainStar: true }));

    applyTransforms(mainStars, transforms);

    // 辅星
    const auxStars: StarEntry[] = Object.entries(auxStarMap)
      .filter(([, pos]) => pos === idx)
      .map(([name]) => {
        const entry: StarEntry = { name, isMainStar: false };
        if (transforms[name]) entry.transform = transforms[name];
        return entry;
      });

    return {
      index:           idx,
      branch:          gz.branch,
      stem:            gz.stem,
      name:            getPalaceName(idx, destinyIdx),
      isDestinyPalace: idx === destinyIdx,
      isBodyPalace:    idx === bodyIdx,
      mainStars,
      auxStars,
    };
  });

  // ── Step 9: 大运 ──────────────────────────────────────────────────────
  const daYun = buildDaYun(
    destinyIdx,
    destStemIdx,
    lunar.yearStemIndex,
    input.gender,
    fivePhase.startAge,
  );

  return {
    input,
    lunar,
    destinyPalaceIndex:  destinyIdx,
    bodyPalaceIndex:     bodyIdx,
    destinyPalaceStem:   destGanZhi.stem,
    fivePhase,
    palaces,
    daYun,
  };
}
