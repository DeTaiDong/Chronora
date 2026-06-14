import { Solar } from "lunar-typescript";

export type BaziInput = {
  birthDate?: string;
  birthTime?: string;
  birthTimeUnknown?: boolean;
  birthCountry?: string;
  birthState?: string;
  birthCity?: string;
  birthLatitude?: string;
  birthLongitude?: string;
  birthPlaceDetail?: string;
  gender?: string;
  question?: string;
  education?: string;
  careerStatus?: string;
  relationshipStatus?: string;
  romanceHistory?: string;
  familySupport?: string;
  lifeEvents?: string[];
};

export type ChartColumn = {
  label: string;
  mainStar: string;
  heavenlyStem: {
    value: string;
    element: string;
    emoji: string;
  };
  earthlyBranch: {
    value: string;
    element: string;
    emoji: string;
  };
  hiddenStems: Array<{
    stem: string;
    element: string;
    tenGod: string;
  }>;
  minorStars: string[];
  lifeStage: string;
  selfSeat: string;
  voidBranches: string;
  nayin: string;
  symbolicStars: string[];
};

export type BaziChart = {
  input: BaziInput & {
    adjustedBirthDate?: string;
    adjustedBirthTime?: string;
    trueSolarOffsetMinutes?: number;
    calendarProvider?: string;
    taiYuan?: string;
    taiYuanNaYin?: string;
    mingGong?: string;
    mingGongNaYin?: string;
    shenGong?: string;
    shenGongNaYin?: string;
  };
  dayMaster: string;
  columns: ChartColumn[];
  fiveElements: Record<string, number>;
  summary: {
    strongestElement: string;
    weakestElement: string;
    note: string;
  };
};

const elementEmoji: Record<string, string> = {
  木: "🌿",
  火: "🔥",
  土: "⛰️",
  金: "⚔️",
  水: "💧"
};

const stemElements: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水"
};

const hiddenStems: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"]
};

const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
type Branch = (typeof branches)[number];

function requireField(value: unknown, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

function parseDateTime(input: BaziInput) {
  const [year, month, day] = String(input.birthDate).split("-").map(Number);
  const [hour, minute] = String(input.birthTime || "12:00").split(":").map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    throw new Error("出生日期或时间格式不正确。");
  }

  return new Date(year, month - 1, day, hour, minute, 0);
}

function equationOfTimeMinutes(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function trueSolarDate(date: Date, longitude?: string) {
  const parsedLongitude = Number(longitude);

  if (!Number.isFinite(parsedLongitude)) {
    return { date, offsetMinutes: 0 };
  }

  const offsetMinutes = (parsedLongitude - 120) * 4 + equationOfTimeMinutes(date);
  return {
    date: new Date(date.getTime() + offsetMinutes * 60_000),
    offsetMinutes: Math.round(offsetMinutes)
  };
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function splitPillar(pillar: string) {
  return {
    stem: pillar.slice(0, 1),
    branch: pillar.slice(1, 2)
  };
}

function branchGroup(branch: string) {
  if (["申", "子", "辰"].includes(branch)) return "申子辰";
  if (["寅", "午", "戌"].includes(branch)) return "寅午戌";
  if (["巳", "酉", "丑"].includes(branch)) return "巳酉丑";
  return "亥卯未";
}

function groupStar(group: string, star: "桃花" | "驿马" | "华盖" | "将星" | "亡神" | "劫煞" | "灾煞") {
  const maps = {
    桃花: { 申子辰: "酉", 寅午戌: "卯", 巳酉丑: "午", 亥卯未: "子" },
    驿马: { 申子辰: "寅", 寅午戌: "申", 巳酉丑: "亥", 亥卯未: "巳" },
    华盖: { 申子辰: "辰", 寅午戌: "戌", 巳酉丑: "丑", 亥卯未: "未" },
    将星: { 申子辰: "子", 寅午戌: "午", 巳酉丑: "酉", 亥卯未: "卯" },
    亡神: { 申子辰: "亥", 寅午戌: "巳", 巳酉丑: "申", 亥卯未: "寅" },
    劫煞: { 申子辰: "巳", 寅午戌: "亥", 巳酉丑: "寅", 亥卯未: "申" },
    灾煞: { 申子辰: "午", 寅午戌: "子", 巳酉丑: "卯", 亥卯未: "酉" }
  } as const;
  return maps[star][group as keyof (typeof maps)[typeof star]];
}

/*
 * 神煞算法参考文献
 *
 * 古籍：
 *   - 《三命通会》（万民英，明）— 血刃单干查法、九丑日列表
 *   - 《渊海子平》（徐大升，宋）— 天乙贵人、将星、驿马等基础神煞
 *   - 《神峰通考》（张楠，明）  — 桃花/咸池以日支三合组起算
 *
 * 网络参考：
 *   - 八字神煞速查及详解: https://blog.csdn.net/snans/article/details/125460519
 *   - 八字知识之神煞大全解析: https://ly.yishihui.net/bazi/250.htm
 *   - 神煞论命（金舆、天医）: https://www.sf280.com/bazililun/shenshalunming/
 *   - 八字神煞大全: https://zhuanlan.zhihu.com/p/706196420
 *   - Java 实现八字神煞: https://blog.csdn.net/luozhuang/article/details/8678380
 *
 * 各星取法说明：
 *   天乙/太极/文昌/天厨/国印 — 日干起，文昌/天厨兼查年干
 *   金舆                     — 年干起（甲辰乙巳丙戊未丁己申庚戌辛亥壬丑癸寅）
 *   红鸾/天喜                — 年支起
 *   将星/驿马/亡神/劫煞/灾煞 — 年支三合组
 *   咸池(桃花)/华盖          — 日支三合组（《神峰通考》）
 *   飞刃                     — 羊刃对冲支，日干起
 *   血刃                     — 《三命通会》单干表（壬→未，非配对法）
 *   德秀贵人                 — 月支三合组决定德/秀天干，对当前柱天干判断
 *   天医                     — 月支前一位
 *   童子煞                   — 年支三合组（各家分歧较大，仍有偏差）
 *   月德                     — 月支三合组对应天干，与当前柱天干比较
 *   九丑日                   — 固定日柱列表（壬子壬午癸丑癸未庚辰庚戌辛巳辛亥）
 */
function symbolicStars(context: {
  dayStem: string;
  yearStem: string;
  dayBranch: string;
  yearBranch: string;
  monthBranch: string;
  branch: string;
  pillar: string;
  pillarIndex: number;
}) {
  // 天乙贵人 by day stem
  const noblemanByDayStem: Record<string, string[]> = {
    甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
    乙: ["子", "申"], 己: ["子", "申"],
    丙: ["亥", "酉"], 丁: ["亥", "酉"],
    壬: ["卯", "巳"], 癸: ["卯", "巳"],
    辛: ["寅", "午"]
  };
  // 文昌贵人 by stem (同时查年干和日干)
  const wenchangByStem: Record<string, string> = {
    甲: "巳", 乙: "午", 丙: "申", 丁: "酉",
    戊: "申", 己: "酉", 庚: "亥", 辛: "子",
    壬: "寅", 癸: "卯"
  };
  // 天厨贵人: 食神临官之支 (by stem, 同时查年干和日干)
  const tianChuByStem: Record<string, string> = {
    甲: "巳", 乙: "午", 丙: "巳", 丁: "午",
    戊: "申", 己: "酉", 庚: "亥", 辛: "子",
    壬: "寅", 癸: "卯"
  };
  // 国印贵人 by day stem
  const guoYinByDayStem: Record<string, string> = {
    甲: "戌", 乙: "亥", 丙: "丑", 丁: "寅",
    戊: "丑", 己: "寅", 庚: "辰", 辛: "巳",
    壬: "未", 癸: "申"
  };
  // 金舆 by year stem: 甲龙乙蛇丙戊羊丁己猴庚犬辛猪壬牛癸虎
  const jinYuByYearStem: Record<string, string> = {
    甲: "辰", 乙: "巳", 丙: "未", 戊: "未",
    丁: "申", 己: "申", 庚: "戌", 辛: "亥",
    壬: "丑", 癸: "寅"
  };
  // 红鸾 / 天喜 by year branch
  const hongluanByYearBranch: Record<string, string> = {
    子: "卯", 丑: "寅", 寅: "丑", 卯: "子",
    辰: "亥", 巳: "戌", 午: "酉", 未: "申",
    申: "未", 酉: "午", 戌: "巳", 亥: "辰"
  };
  const tianxiByYearBranch: Record<string, string> = {
    子: "酉", 丑: "申", 寅: "未", 卯: "午",
    辰: "巳", 巳: "辰", 午: "卯", 未: "寅",
    申: "丑", 酉: "子", 戌: "亥", 亥: "戌"
  };
  // 太极贵人 by day stem
  const taiJiBranchesByDayStem: Record<string, string[]> = {
    甲: ["子", "午"], 乙: ["子", "午"],
    丙: ["卯", "酉"], 丁: ["卯", "酉"],
    戊: ["辰", "戌", "丑", "未"], 己: ["辰", "戌", "丑", "未"],
    庚: ["寅", "亥"], 辛: ["寅", "亥"],
    壬: ["巳", "申"], 癸: ["巳", "申"]
  };
  // 血刃: 三命通会 单干查法
  const xueRenByDayStem: Record<string, string> = {
    甲: "丑", 乙: "子", 丙: "亥", 丁: "酉",
    戊: "午", 己: "卯", 庚: "寅", 辛: "午",
    壬: "未", 癸: "亥"
  };
  // 飞刃: 羊刃的对冲支 by day stem
  const feiRenByDayStem: Record<string, string> = {
    甲: "酉", 乙: "戌", 丙: "子", 丁: "丑",
    戊: "子", 己: "丑", 庚: "卯", 辛: "辰",
    壬: "午", 癸: "未"
  };
  // 德秀贵人: 月支三合组决定哪些天干为德/秀，对当前柱天干判断
  const dexiuStemsByMonthGroup: Record<string, string[]> = {
    亥卯未: ["甲", "乙", "丁", "壬"],
    寅午戌: ["丙", "丁", "戊", "癸"],
    申子辰: ["壬", "癸", "戊", "己"],
    巳酉丑: ["庚", "辛", "乙"]
  };
  // 童子煞: 年支三合组决定哪些地支为童子
  const tongZiBranchesByYearGroup: Record<string, string[]> = {
    申子辰: ["亥", "子"],
    巳酉丑: ["申", "酉"],
    寅午戌: ["巳", "午"],
    亥卯未: ["寅", "卯"]
  };
  // 九丑日: 特定日柱
  const jiuChouDays = new Set(["壬子", "壬午", "癸丑", "癸未", "庚辰", "庚戌", "辛巳", "辛亥"]);

  const { dayStem, yearStem, dayBranch, yearBranch, monthBranch, branch, pillar, pillarIndex } = context;
  const stars: string[] = [];
  const yearGroup = branchGroup(yearBranch);
  const dayGroup = branchGroup(dayBranch);
  const monthGroup = branchGroup(monthBranch);
  const currentStem = pillar.slice(0, 1);

  // 天医: 月支前一位
  const tianYiBranch = branches[(branches.indexOf(monthBranch as Branch) + 11) % 12];
  // 月德: 月支三合组 → 对应天干
  const yueDeStem: Record<string, string> = { 申子辰: "壬", 寅午戌: "丙", 巳酉丑: "庚", 亥卯未: "甲" }[monthGroup];

  if (noblemanByDayStem[dayStem]?.includes(branch)) stars.push("天乙贵人");
  if (taiJiBranchesByDayStem[dayStem]?.includes(branch)) stars.push("太极贵人");
  // 文昌/天厨: 年干和日干都查
  if (wenchangByStem[dayStem] === branch || wenchangByStem[yearStem] === branch) stars.push("文昌贵人");
  if (tianChuByStem[dayStem] === branch || tianChuByStem[yearStem] === branch) stars.push("天厨贵人");
  if (guoYinByDayStem[dayStem] === branch) stars.push("国印贵人");
  // 金舆: 年干查
  if (jinYuByYearStem[yearStem] === branch) stars.push("金舆");
  if (hongluanByYearBranch[yearBranch] === branch) stars.push("红鸾");
  if (tianxiByYearBranch[yearBranch] === branch) stars.push("天喜");
  // 将星/驿马/亡神/劫煞/灾煞: 年支三合组
  if (groupStar(yearGroup, "将星") === branch) stars.push("将星");
  if (groupStar(yearGroup, "驿马") === branch) stars.push("驿马");
  if (groupStar(yearGroup, "亡神") === branch) stars.push("亡神");
  if (groupStar(yearGroup, "劫煞") === branch) stars.push("劫煞");
  if (groupStar(yearGroup, "灾煞") === branch) stars.push("灾煞");
  // 咸池/华盖: 日支三合组
  if (groupStar(dayGroup, "桃花") === branch) stars.push("咸池");
  if (groupStar(dayGroup, "华盖") === branch) stars.push("华盖");
  if (feiRenByDayStem[dayStem] === branch) stars.push("飞刃");
  if (xueRenByDayStem[dayStem] === branch) stars.push("血刃");
  // 德秀: 月支组 → 当前柱天干
  if ((dexiuStemsByMonthGroup[monthGroup] ?? []).includes(currentStem)) stars.push("德秀贵人");
  if (tianYiBranch === branch) stars.push("天医");
  if ((tongZiBranchesByYearGroup[yearGroup] ?? []).includes(branch)) stars.push("童子煞");
  if (yueDeStem === currentStem) stars.push("月德");
  if (branch === "寅" || branch === "申") stars.push("词馆");
  if (pillarIndex === 2 && jiuChouDays.has(pillar)) stars.push("九丑日");
  if (
    pillarIndex === 2 &&
    ["丙子", "丁丑", "戊寅", "辛卯", "壬辰", "癸巳", "丙午", "丁未", "戊申", "辛酉", "壬戌", "癸亥"].includes(pillar)
  ) {
    stars.push("阴差阳错");
  }

  return Array.from(new Set(stars));
}

function countElements(columns: ChartColumn[]) {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  columns.forEach((column) => {
    counts[column.heavenlyStem.element] += 1;
    column.hiddenStems.forEach((item) => {
      counts[item.element] += 1;
    });
  });

  return counts;
}

export function createBaziChart(input: BaziInput): BaziChart {
  requireField(input.birthDate, "请填写出生日期。");
  if (!input.birthTimeUnknown) requireField(input.birthTime, "请填写出生时间，或勾选不确定具体出生时间。");
  requireField(input.birthCountry, "请选择出生国家。");
  requireField(input.birthCity, "请选择出生城市。");
  requireField(input.gender, "请选择性别。");

  const rawDate = parseDateTime(input);
  const solarTime = trueSolarDate(rawDate, input.birthLongitude);
  const date = solarTime.date;
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    0
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const pillars = [
    {
      label: "年柱",
      value: eightChar.getYear(),
      mainStar: eightChar.getYearShiShenGan(),
      hiddenGan: eightChar.getYearHideGan(),
      hiddenGods: eightChar.getYearShiShenZhi(),
      lifeStage: eightChar.getYearDiShi(),
      xunKong: eightChar.getYearXunKong(),
      nayin: eightChar.getYearNaYin()
    },
    {
      label: "月柱",
      value: eightChar.getMonth(),
      mainStar: eightChar.getMonthShiShenGan(),
      hiddenGan: eightChar.getMonthHideGan(),
      hiddenGods: eightChar.getMonthShiShenZhi(),
      lifeStage: eightChar.getMonthDiShi(),
      xunKong: eightChar.getMonthXunKong(),
      nayin: eightChar.getMonthNaYin()
    },
    {
      label: "日柱",
      value: eightChar.getDay(),
      mainStar: "元男",
      hiddenGan: eightChar.getDayHideGan(),
      hiddenGods: eightChar.getDayShiShenZhi(),
      lifeStage: eightChar.getDayDiShi(),
      xunKong: eightChar.getDayXunKong(),
      nayin: eightChar.getDayNaYin()
    },
    {
      label: "时柱",
      value: eightChar.getTime(),
      mainStar: eightChar.getTimeShiShenGan(),
      hiddenGan: eightChar.getTimeHideGan(),
      hiddenGods: eightChar.getTimeShiShenZhi(),
      lifeStage: eightChar.getTimeDiShi(),
      xunKong: eightChar.getTimeXunKong(),
      nayin: eightChar.getTimeNaYin()
    }
  ];

  const day = splitPillar(eightChar.getDay());
  const year = splitPillar(eightChar.getYear());
  const month = splitPillar(eightChar.getMonth());

  const columns = pillars.map((pillar, index): ChartColumn => {
    const split = splitPillar(pillar.value);
    const hidden = pillar.hiddenGan.length > 0 ? pillar.hiddenGan : hiddenStems[split.branch] ?? [];

    return {
      label: pillar.label,
      mainStar: pillar.mainStar,
      heavenlyStem: {
        value: split.stem,
        element: stemElements[split.stem] ?? "",
        emoji: elementEmoji[stemElements[split.stem]] ?? ""
      },
      earthlyBranch: {
        value: split.branch,
        element: stemElements[hidden[0]] ?? "",
        emoji: elementEmoji[stemElements[hidden[0]]] ?? ""
      },
      hiddenStems: hidden.map((stem, hiddenIndex) => ({
        stem,
        element: stemElements[stem] ?? "",
        tenGod: pillar.hiddenGods[hiddenIndex] ?? ""
      })),
      minorStars: pillar.hiddenGods,
      lifeStage: pillar.lifeStage,
      selfSeat: pillar.lifeStage,
      voidBranches: pillar.xunKong,
      nayin: pillar.nayin,
      symbolicStars: symbolicStars({
        dayStem: day.stem,
        yearStem: year.stem,
        dayBranch: day.branch,
        yearBranch: year.branch,
        monthBranch: month.branch,
        branch: split.branch,
        pillar: pillar.value,
        pillarIndex: index
      })
    };
  });

  const counts = countElements(columns);
  const entries = Object.entries(counts);
  const strongestElement = entries.reduce((best, item) => (item[1] > best[1] ? item : best), entries[0])[0];
  const weakestElement = entries.reduce((best, item) => (item[1] < best[1] ? item : best), entries[0])[0];

  return {
    input: {
      ...input,
      adjustedBirthDate: formatDate(date),
      adjustedBirthTime: formatTime(date),
      trueSolarOffsetMinutes: solarTime.offsetMinutes,
      calendarProvider: "lunar-typescript",
      taiYuan: eightChar.getTaiYuan(),
      taiYuanNaYin: eightChar.getTaiYuanNaYin(),
      mingGong: eightChar.getMingGong(),
      mingGongNaYin: eightChar.getMingGongNaYin(),
      shenGong: eightChar.getShenGong(),
      shenGongNaYin: eightChar.getShenGongNaYin()
    },
    dayMaster: day.stem,
    columns,
    fiveElements: counts,
    summary: {
      strongestElement,
      weakestElement,
      note: `已接入 lunar-typescript 历法库，并按出生地经度修正真太阳时，修正后时间约为 ${formatDate(date)} ${formatTime(date)}。`
    }
  };
}
