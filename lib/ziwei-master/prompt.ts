import type { ZiweiChart } from "@/lib/ziwei/types";

export const ziweiMasterSystemPrompt = `
你是一位精通紫微斗数的命理顾问，以简洁、务实的风格给予解读。

规则：
1. 只根据命盘与用户提供的问题/背景作答，不作空泛推断。
2. 使用"先生"自称，用词古雅但易懂，段落简短。
3. 不预测具体日期、不保证结果，以"可留意""分寸"代替绝对结论。
4. 若问题与命盘明显无关（彩票、他人隐私等），礼貌拒绝并将 isRefusal 设为 true。
5. 回答结构：title（5-10字标题）+ answer（800-1200个汉字，5-8段，段落之间用两个换行分隔）+ focusAreas（≤4条）+ cautions（≤3条）。
6. answer 第一段先给直接结论；随后说明命宫、身宫、相关宫位、主辅星与四化依据；再结合用户背景回应所问；最后给现实可执行建议与分寸提醒。不要只罗列星曜，也不要为了凑字重复。
7. 若是拒答，answer 可以简短，不受 800-1200 字限制。
`.trim();

export function buildZiweiMasterUserPrompt(chart: ZiweiChart): string {
  const { input, lunar, fivePhase, destinyPalaceIndex, palaces, daYun } = chart;

  const destinyPalace = palaces[destinyPalaceIndex];
  const destinyMainStars = destinyPalace.mainStars.map((s) =>
    s.transform ? `${s.name}${s.transform}` : s.name,
  ).join("、") || "无主星";

  const bodyPalace = palaces[chart.bodyPalaceIndex];
  const bodyMainStars = bodyPalace.mainStars.map((s) => s.name).join("、") || "无主星";

  const palaceSummary = palaces
    .map((p) => {
      const ms = p.mainStars.map((s) => s.transform ? `${s.name}${s.transform}` : s.name).join(" ");
      const as = p.auxStars.map((s) => s.name).join(" ");
      return `${p.name}[${p.stem}${p.branch}] 主:${ms || "空"} 辅:${as || "无"}${p.isDestinyPalace ? " ★命" : ""}${p.isBodyPalace ? " ◎身" : ""}`;
    })
    .join("\n");

  const dayunSummary = daYun
    .map((dy) => `${dy.startAge}-${dy.endAge}岁 ${dy.stem}${dy.branch}(${dy.palaceName})`)
    .join("  ");

  const secondaryLines: string[] = [];
  if (input.question)            secondaryLines.push(`所问：${input.question}`);
  if (input.education)           secondaryLines.push(`学历/学习：${input.education}`);
  if (input.careerStatus)        secondaryLines.push(`事业：${input.careerStatus}`);
  if (input.relationshipStatus)  secondaryLines.push(`感情：${input.relationshipStatus}`);
  if (input.romanceHistory)      secondaryLines.push(`恋爱经历：${input.romanceHistory}`);
  if (input.familySupport)       secondaryLines.push(`家庭支持：${input.familySupport}`);
  if (input.lifeEvents?.length)  secondaryLines.push(`重要经历：${input.lifeEvents.filter(Boolean).join("、")}`);

  return `
【命盘信息】
农历：${lunar.yearGanZhi}年 ${lunar.month}月${lunar.day}日
性别：${input.gender === "male" ? "男" : "女"}
五行局：${fivePhase.name}（起运${fivePhase.startAge}岁）
命宫：${destinyPalace.stem}${destinyPalace.branch} 主星：${destinyMainStars}
身宫：${bodyPalace.stem}${bodyPalace.branch} 主星：${bodyMainStars}

【十二宫概览】
${palaceSummary}

【大运】
${dayunSummary}

【用户信息】
${secondaryLines.join("\n") || "（用户未提供）"}

请按上述规则正常作答时写足 800-1200 个汉字，分段完整；不要只给简短批语。
`.trim();
}
