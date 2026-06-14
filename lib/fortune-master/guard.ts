import type { BaziInput } from "@/app/bazi/chartEngine";

const fortuneKeywords = [
  "八字",
  "命",
  "命盘",
  "运",
  "流年",
  "大运",
  "事业",
  "工作",
  "财",
  "财运",
  "感情",
  "姻缘",
  "婚",
  "恋爱",
  "家庭",
  "父母",
  "学业",
  "健康",
  "性格",
  "贵人",
  "方向",
  "适合",
  "选择",
  "什么时候",
  "如何"
];

const unrelatedKeywords = [
  "代码",
  "编程",
  "算法",
  "证明",
  "定理",
  "引理",
  "翻译",
  "论文",
  "写作业",
  "考试答案",
  "股票代码",
  "投资建议",
  "诊断",
  "处方",
  "法律意见"
];

export function hasSecondaryInfo(input: BaziInput) {
  return Boolean(
    input.question?.trim() ||
      input.education?.trim() ||
      input.careerStatus?.trim() ||
      input.relationshipStatus?.trim() ||
      input.romanceHistory?.trim() ||
      input.familySupport?.trim() ||
      input.lifeEvents?.some((event) => event.trim())
  );
}

export function normalizeQuestion(question?: string) {
  return question?.replace(/\s+/g, " ").trim() ?? "";
}

export function shouldStaySilent(input: BaziInput) {
  return !normalizeQuestion(input.question);
}

export function isClearlyUnrelatedQuestion(question?: string) {
  const normalized = normalizeQuestion(question).toLowerCase();

  if (!normalized) return false;

  const hasFortuneSignal = fortuneKeywords.some((keyword) => normalized.includes(keyword));
  const hasUnrelatedSignal = unrelatedKeywords.some((keyword) => normalized.includes(keyword));

  return hasUnrelatedSignal && !hasFortuneSignal;
}

export function fixedRefusalAnswer() {
  return {
    isRefusal: true,
    title: "此问不入命盘",
    answer:
      "此问不在命盘所照之内，贫道不妄断他术。若问流年、事业、姻缘、财气、性情取舍，可据盘细看。",
    focusAreas: [],
    cautions: ["请将问题限定在八字命盘、人生选择与运势倾向之内。"]
  };
}
