import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { fortuneMasterSystemPrompt, buildFortuneMasterUserPrompt } from "@/lib/fortune-master/prompt";
import { shouldStaySilent, isClearlyUnrelatedQuestion, fixedRefusalAnswer } from "@/lib/fortune-master/guard";
import type { BaziChart } from "@/app/bazi/chartEngine";
import type { FortuneMasterResponse } from "@/lib/fortune-master";

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isRefusal: {
      type: SchemaType.BOOLEAN,
      description: "Whether the answer refuses an unrelated or unsupported request."
    },
    title: {
      type: SchemaType.STRING,
      description: "A short classical Chinese-style title for the reading."
    },
    answer: {
      type: SchemaType.STRING,
      description: "The main answer, written in plain modern Chinese."
    },
    focusAreas: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Three to five concise points the user should pay attention to."
    },
    cautions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Practical cautions, avoiding deterministic claims."
    }
  },
  required: ["isRefusal", "title", "answer", "focusAreas", "cautions"]
};

function apiError(code: string, message: string, detail?: string, status = 500) {
  return NextResponse.json({ error: { code, message, detail } }, { status });
}

function isFortuneMasterResponse(value: unknown): value is FortuneMasterResponse {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<FortuneMasterResponse>;
  return (
    typeof item.isRefusal === "boolean" &&
    typeof item.title === "string" &&
    typeof item.answer === "string" &&
    Array.isArray(item.focusAreas) &&
    Array.isArray(item.cautions)
  );
}

export async function POST(request: NextRequest) {
  let chart: BaziChart;

  try {
    chart = (await request.json()) as BaziChart;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return apiError("invalid_request", "请求数据格式不正确，请返回重新排盘。", detail, 400);
  }

  if (!chart?.input) {
    return apiError("invalid_chart", "命盘数据缺失，请返回重新排盘。", undefined, 400);
  }

  if (shouldStaySilent(chart.input)) {
    return NextResponse.json(null);
  }

  if (isClearlyUnrelatedQuestion(chart.input.question)) {
    return NextResponse.json(fixedRefusalAnswer());
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return apiError("missing_api_key", "未配置 GEMINI_API_KEY，请在 .env.local 中补充后重启开发服务器。");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
      systemInstruction: fortuneMasterSystemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema
      } as never
    });

    const result = await model.generateContent(buildFortuneMasterUserPrompt(chart));
    const content = result.response.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error("[fortune-master] invalid json:", detail, content);
      return apiError("invalid_model_json", "模型返回的 JSON 格式不正确，请重新生成一次。", detail);
    }

    if (!isFortuneMasterResponse(parsed)) {
      console.error("[fortune-master] invalid response shape:", parsed);
      return apiError("invalid_model_schema", "模型返回内容缺少必要字段，请重新生成一次。");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[fortune-master] generate error:", msg);
    return apiError("model_request_failed", "AI 解读服务请求失败，请检查网络、额度或模型配置。", msg);
  }
}
