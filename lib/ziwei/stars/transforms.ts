// ─── 四化（化禄/化权/化科/化忌） ──────────────────────────────────────────
// 按出生年干查表，固定对应四颗星

import type { StarEntry } from "../types";

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

// [化禄, 化权, 化科, 化忌]
const FOUR_TRANSFORMS: Record<string, [string, string, string, string]> = {
  "甲": ["廉贞","破军","武曲","太阳"],
  "乙": ["天机","天梁","紫微","太阴"],
  "丙": ["天同","天机","文昌","廉贞"],
  "丁": ["太阴","天同","天机","巨门"],
  "戊": ["贪狼","太阴","右弼","天机"],
  "己": ["武曲","贪狼","天梁","文曲"],
  "庚": ["太阳","武曲","太阴","天同"],
  "辛": ["巨门","太阳","文曲","文昌"],
  "壬": ["天梁","紫微","左辅","武曲"],
  "癸": ["破军","巨门","太阴","贪狼"],
};

export type TransformMap = Record<string, "化禄" | "化权" | "化科" | "化忌">;

export function getFourTransforms(yearStemIndex: number): TransformMap {
  const stem = STEMS[yearStemIndex];
  const [lu, quan, ke, ji] = FOUR_TRANSFORMS[stem];
  return {
    [lu]:   "化禄",
    [quan]: "化权",
    [ke]:   "化科",
    [ji]:   "化忌",
  };
}

// 将四化叠加到 StarEntry 上（mutates in place）
export function applyTransforms(
  stars: StarEntry[],
  transforms: TransformMap,
): void {
  for (const star of stars) {
    if (transforms[star.name]) {
      star.transform = transforms[star.name];
    }
  }
}
