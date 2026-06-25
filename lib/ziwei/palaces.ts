// ─── 命宫/身宫定位 + 12宫布局 ─────────────────────────────────────────────

export const PALACE_NAMES = [
  "命宫","兄弟宫","夫妻宫","子女宫","财帛宫","疾厄宫",
  "迁移宫","仆役宫","官禄宫","田宅宫","福德宫","父母宫",
];

// ── 命宫定位 ──────────────────────────────────────────────────────────────
// 口诀："寅宫起正月，逆布十二支，生时顺安起，命宫在此处。"
// 正月→寅(2)，逆布：正月=2，二月=1，三月=0，四月=11…
// 再从子时(0)顺数时辰到达命宫
export function getDestinyPalaceIndex(
  lunarMonth: number,       // 1-12
  hourBranchIndex: number,  // 0-11
): number {
  const monthBase = (3 - lunarMonth + 120) % 12; // 寅(2)逆布后的起点
  return (monthBase + hourBranchIndex) % 12;
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
