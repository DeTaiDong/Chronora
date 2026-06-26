// ─── 辅星安法 ──────────────────────────────────────────────────────────────
// 返回 {星名: 宫位index(0-11)} 的映射

export function placeAuxStars(
  yearStemIndex: number,   // 0=甲…9=癸
  yearBranchIndex: number, // 0=子…11=亥
  lunarMonth: number,      // 1-12
  hourBranchIndex: number, // 0=子…11=亥
): Record<string, number> {

  // ── 天魁/天钺（年干贵人） ────────────────────────────────────────────
  // [天魁宫位, 天钺宫位]，按年干索引
  const kuiYue: [number, number][] = [
    [1, 7], // 甲 → 丑(1)/未(7)
    [3, 9], // 乙 → 卯(3)/酉(9)
    [2, 8], // 丙 → 寅(2)/申(8)
    [5,11], // 丁 → 巳(5)/亥(11)
    [2, 8], // 戊 → 寅(2)/申(8)
    [1, 7], // 己 → 丑(1)/未(7)
    [3, 9], // 庚 → 卯(3)/酉(9)
    [5,11], // 辛 → 巳(5)/亥(11)
    [4,10], // 壬 → 辰(4)/戌(10)
    [4,10], // 癸 → 辰(4)/戌(10)
  ];
  const [tianKui, tianYue] = kuiYue[yearStemIndex];

  // ── 禄存/擎羊/陀罗（年干三星） ─────────────────────────────────────
  // 禄存所在地支 by 年干（甲寅乙卯丙巳丁午戊巳己午庚申辛酉壬亥癸子）
  const luCunBranch = [2,3,5,6,5,6,8,9,11,0][yearStemIndex]; // 甲→寅(2)…
  const luCun  = luCunBranch;
  const yangRen = (luCun + 1) % 12;   // 擎羊在禄存顺一位
  const tuoLuo  = (luCun - 1 + 12) % 12; // 陀罗在禄存逆一位

  // ── 火星/铃星（年支+时辰） ──────────────────────────────────────────
  // 起始地支 by 年支三合局
  // 寅午戌年→丑(1)起；申子辰年→酉(9)起；巳酉丑年→卯(3)起；亥卯未年→酉(9)起
  let huoBase: number;
  const yb = yearBranchIndex;
  if ([2, 6, 10].includes(yb))      huoBase = 1;  // 寅午戌→丑
  else if ([8, 0, 4].includes(yb))  huoBase = 9;  // 申子辰→酉
  else if ([5, 9, 1].includes(yb))  huoBase = 3;  // 巳酉丑→卯
  else                               huoBase = 9;  // 亥卯未→酉

  const huoXing  = (huoBase + hourBranchIndex) % 12;
  // 铃星起点与火星相差两宫（三合派常见安法）
  const lingBase = (huoBase + 2) % 12;
  const lingXing = (lingBase + hourBranchIndex) % 12;

  // ── 文昌/文曲（时辰） ────────────────────────────────────────────────
  // 文昌：从戌(10)逆数时辰
  const wenChang = (10 - hourBranchIndex + 12) % 12;
  // 文曲：从辰(4)顺数时辰
  const wenQu    = (4 + hourBranchIndex) % 12;

  // ── 左辅/右弼（月份） ────────────────────────────────────────────────
  // 左辅：从辰(4)顺数，正月在辰 → (3 + lunarMonth) % 12
  const zuoFu = (3 + lunarMonth) % 12;
  // 右弼：从戌(10)逆数，正月在戌 → (11 - lunarMonth + 12) % 12
  const youBi = (11 - lunarMonth + 12) % 12;

  // ── 天马（年支） ─────────────────────────────────────────────────────
  // 寅午戌→申(8)；申子辰→寅(2)；巳酉丑→亥(11)；亥卯未→巳(5)
  let tianMa: number;
  if ([2, 6, 10].includes(yb))      tianMa = 8;
  else if ([8, 0, 4].includes(yb))  tianMa = 2;
  else if ([5, 9, 1].includes(yb))  tianMa = 11;
  else                               tianMa = 5;

  // ── 地劫/地空（时辰） ────────────────────────────────────────────────
  // 地劫：从亥(11)顺数时辰
  const diJie = (11 + hourBranchIndex) % 12;
  // 地空：从亥(11)逆数时辰
  const diKong = (11 - hourBranchIndex + 12) % 12;

  return {
    "天魁": tianKui,
    "天钺": tianYue,
    "禄存": luCun,
    "擎羊": yangRen,
    "陀罗": tuoLuo,
    "火星": huoXing,
    "铃星": lingXing,
    "文昌": wenChang,
    "文曲": wenQu,
    "左辅": zuoFu,
    "右弼": youBi,
    "天马": tianMa,
    "地劫": diJie,
    "地空": diKong,
  };
}
