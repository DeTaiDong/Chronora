// ─── 命宫/身宫定位 + 12宫布局 ─────────────────────────────────────────────

export const PALACE_NAMES = [
  "命宫","兄弟宫","夫妻宫","子女宫","财帛宫","疾厄宫",
  "迁移宫","仆役宫","官禄宫","田宅宫","福德宫","父母宫",
];

// ── 命宫定位 ──────────────────────────────────────────────────────────────
// 口诀："寅宫起正月，顺布十二月，逆数生时得命宫。"
// 寅(index=2)起正月，顺布到生月；再从生月位置逆数时辰
export function getDestinyPalaceIndex(
  lunarMonth: number,       // 1-12
  hourBranchIndex: number,  // 0-11
): number {
  const monthPos = (2 + lunarMonth - 1) % 12; // 寅起正月顺推到生月
  return (monthPos - hourBranchIndex + 12) % 12;
}

// ── 身宫定位 ──────────────────────────────────────────────────────────────
// 口诀："午宫起子时，顺布时辰定身宫。"
export function getBodyPalaceIndex(hourBranchIndex: number): number {
  return (6 + hourBranchIndex) % 12;
}

// ── 宫位名称 ──────────────────────────────────────────────────────────────
// 从命宫顺数，依次对应 PALACE_NAMES[0..11]
export function getPalaceName(
  palaceIndex: number,
  destinyPalaceIndex: number,
): string {
  const offset = (palaceIndex - destinyPalaceIndex + 12) % 12;
  return PALACE_NAMES[offset];
}
