// ─── 阳历 → 农历 转换 + 天干地支辅助 ──────────────────────────────────────
// 依赖项目已有的 lunar-typescript 库

import { Solar } from "lunar-typescript";
import type { LunarDate } from "./types";

export const STEMS   = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
export const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// 时辰地支索引：23点归入子时（下一日子时）
// 子(23,0)=0, 丑(1,2)=1, 寅(3,4)=2, 卯(5,6)=3,
// 辰(7,8)=4, 巳(9,10)=5, 午(11,12)=6, 未(13,14)=7,
// 申(15,16)=8, 酉(17,18)=9, 戌(19,20)=10, 亥(21,22)=11
export function hourToBranchIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

export function solarToLunar(year: number, month: number, day: number): LunarDate {
  const solar = Solar.fromYmd(year, month, day);
  const lunar  = solar.getLunar();

  const yearGanZhi   = lunar.getYearInGanZhi(); // e.g. "甲子"
  const yearStemIdx  = STEMS.indexOf(yearGanZhi[0]);
  const yearBranchIdx = BRANCHES.indexOf(yearGanZhi[1]);

  const rawMonth = lunar.getMonth(); // 闰月为负数
  return {
    year:            lunar.getYear(),
    month:           Math.abs(rawMonth),
    day:             lunar.getDay(),
    isLeapMonth:     rawMonth < 0,
    yearStemIndex:   yearStemIdx,
    yearBranchIndex: yearBranchIdx,
    yearGanZhi,
  };
}

// 获取某宫位的干支（用于五行局计算）
// 五虎遁年起月法：根据年干确定寅月（正月）天干，后续各月顺推
export function getPalaceGanZhi(
  yearStemIndex: number,
  palaceIndex: number, // 0=子…11=亥
): { stem: string; branch: string } {
  // 寅宫(index=2)对应的起始天干 by 年干
  // 甲己→丙(2) 乙庚→戊(4) 丙辛→庚(6) 丁壬→壬(8) 戊癸→甲(0)
  const yinStarts = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const stemIdx   = (yinStarts[yearStemIndex] + ((palaceIndex - 2 + 12) % 12)) % 10;
  return { stem: STEMS[stemIdx], branch: BRANCHES[palaceIndex] };
}
