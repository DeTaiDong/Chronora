// ─── 紫微星安法 ────────────────────────────────────────────────────────────
// 根据农历生日和五行局数，确定紫微星所在宫位（0=子…11=亥）
//
// 算法（多数紫微软件通行实现）：
//   rem = lunarDay % base
//   若 rem == 0 → 宫位 = lunarDay/base - 1
//   若 rem != 0 → 宫位 = floor(lunarDay/base) + (base - rem)

export function getZiWeiPalaceIndex(
  lunarDay: number,      // 1-30
  fivePhaseNum: number,  // 2/3/4/5/6
): number {
  const r = lunarDay % fivePhaseNum;
  const q = Math.floor(lunarDay / fivePhaseNum);
  const raw = r === 0 ? q - 1 : q + fivePhaseNum - r;
  return ((raw % 12) + 12) % 12;
}
