// ─── 紫微斗数核心类型定义 ──────────────────────────────────────────────────

export type ZiweiInput = {
  birthDate: string;           // YYYY-MM-DD 阳历
  birthHour: number;           // 0-23（用于推算时辰）
  birthTimeUnknown?: boolean;
  gender: "male" | "female";
  // 用于 AI 解读的辅助信息
  question?: string;
  education?: string;
  careerStatus?: string;
  relationshipStatus?: string;
  romanceHistory?: string;
  familySupport?: string;
  lifeEvents?: string[];
};

export type LunarDate = {
  year: number;
  month: number;          // 1-12（农历）
  day: number;            // 1-30
  isLeapMonth: boolean;
  yearStemIndex: number;  // 0=甲…9=癸
  yearBranchIndex: number;// 0=子…11=亥
  yearGanZhi: string;     // e.g. "甲子"
};

export type FivePhaseInfo = {
  num: number;       // 2/3/4/5/6（局数）
  name: string;      // "水二局" 等
  element: string;   // 水/木/金/土/火
  startAge: number;  // 起运年龄
};

export type StarEntry = {
  name: string;
  transform?: "化禄" | "化权" | "化科" | "化忌";
  isMainStar: boolean;
};

export type Palace = {
  index: number;          // 0-11（子=0…亥=11）
  branch: string;         // 地支
  stem: string;           // 天干
  name: string;           // 命宫/兄弟宫/…
  isDestinyPalace: boolean;
  isBodyPalace: boolean;
  mainStars: StarEntry[];
  auxStars: StarEntry[];
};

export type DaYun = {
  index: number;
  startAge: number;
  endAge: number;
  branch: string;
  stem: string;
  palaceName: string;
};

export type ZiweiChart = {
  input: ZiweiInput;
  lunar: LunarDate;
  destinyPalaceIndex: number;
  bodyPalaceIndex: number;
  destinyPalaceStem: string;
  fivePhase: FivePhaseInfo;
  palaces: Palace[];   // 固定 12 个，index 0-11
  daYun: DaYun[];
};
