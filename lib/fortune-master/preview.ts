import type { BaziChart } from "@/app/bazi/chartEngine";
import { fixedRefusalAnswer, isClearlyUnrelatedQuestion, shouldStaySilent } from "./guard";
import type { FortuneMasterResponse } from "./schema";

function filled(value?: string) {
  return value?.trim();
}

function joinFilled(values: Array<string | undefined>) {
  return values.map(filled).filter(Boolean).join("、");
}

function pillarLine(chart: BaziChart) {
  return chart.columns
    .map((column) => `${column.label}${column.heavenlyStem.value}${column.earthlyBranch.value}`)
    .join("，");
}

function secondaryLine(chart: BaziChart) {
  const input = chart.input;
  const lifeEvents = input.lifeEvents?.map(filled).filter(Boolean).join("、");

  return joinFilled([
    input.education ? `学业为${input.education}` : undefined,
    input.careerStatus ? `事业处于${input.careerStatus}` : undefined,
    input.relationshipStatus ? `感情为${input.relationshipStatus}` : undefined,
    input.romanceHistory ? `情缘经历${input.romanceHistory}` : undefined,
    input.familySupport ? `家中助力${input.familySupport}` : undefined,
    lifeEvents ? `曾经${lifeEvents}` : undefined
  ]);
}

export function generatePreviewFortuneReading(chart: BaziChart): FortuneMasterResponse | null {
  if (shouldStaySilent(chart.input)) return null;
  if (isClearlyUnrelatedQuestion(chart.input.question)) return fixedRefusalAnswer();

  const secondary = secondaryLine(chart);
  const strongest = chart.summary.strongestElement;
  const weakest = chart.summary.weakestElement;
  const question = filled(chart.input.question) ?? "所问之事";
  const monthColumn = chart.columns[1];
  const dayColumn = chart.columns[2];
  const stars = chart.columns.flatMap((column) => column.symbolicStars).slice(0, 4);
  const starLine = stars.length > 0 ? `盘中又见${stars.join("、")}，可作旁证，不宜独执一星而断。` : "";

  return {
    isRefusal: false,
    title: "据盘取象",
    answer: [
      `此盘日主为${chart.dayMaster}，四柱排作：${pillarLine(chart)}。你所问“${question}”，宜先看日主所承之势，再参以月令、十神与五行消长。`,
      `盘面五行以${strongest}气较显，${weakest}气较薄，故行事易有一端偏重、一端不足之象。若问事业与取舍，宜取稳中求进，先补短处，再借强处发力；若问感情，则不宜只凭一时情绪定局，需看现实承托与长期相处。`,
      `${secondary ? `你补充说${secondary}，这比单看命盘更贴近眼前处境。` : "补充资料未详，先生只能从盘面取象，不妄加经历。"}月柱为${monthColumn.heavenlyStem.value}${monthColumn.earthlyBranch.value}，日柱为${dayColumn.heavenlyStem.value}${dayColumn.earthlyBranch.value}，一主外缘时势，一主自身根气，二者相参，说明此事不可急断，须看时机、资源与自身定力。${starLine}`,
      "总的看，此问宜以“先定心，后定路”为纲：能准备者先准备，能沟通者先沟通，能验证者先小步验证。命盘只示趋向，不替人作孤注一掷之决断。"
    ].join("\n\n"),
    focusAreas: [
      `留意${weakest}气不足处，凡相关主题宜补其短板。`,
      `善用${strongest}气所主的执行惯性，但不可过偏。`,
      "重大选择先小范围试行，再作长期承诺。"
    ],
    cautions: [
      "此为本地预览解读，后续接入模型后会有更细的推演。",
      "健康、法律、投资等事项不可只凭命盘决定，应咨询专业人士。"
    ]
  };
}
