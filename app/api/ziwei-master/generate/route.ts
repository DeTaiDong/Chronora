import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ziweiMasterSystemPrompt, buildZiweiMasterUserPrompt, shouldStaySilent } from "@/lib/ziwei-master";
import type { ZiweiChart } from "@/lib/ziwei/types";
import type { ZiweiMasterResponse } from "@/lib/ziwei-master/schema";

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isRefusal:  { type: SchemaType.BOOLEAN },
    title:      { type: SchemaType.STRING },
    answer:     { type: SchemaType.STRING },
    focusAreas: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    cautions:   { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["isRefusal", "title", "answer", "focusAreas", "cautions"],
};

function apiError(code: string, message: string, detail?: string, status = 500) {
  return NextResponse.json({ error: { code, message, detail } }, { status });
}

function isZiweiMasterResponse(v: unknown): v is ZiweiMasterResponse {
  if (!v || typeof v !== "object") return false;
  const r = v as Partial<ZiweiMasterResponse>;
  return (
    typeof r.isRefusal === "boolean" &&
    typeof r.title === "string" &&
    typeof r.answer === "string" &&
    Array.isArray(r.focusAreas) &&
    Array.isArray(r.cautions)
  );
}

export async function POST(request: NextRequest) {
  let chart: ZiweiChart;
  try {
    chart = (await request.json()) as ZiweiChart;
  } catch (error) {
    return apiError("invalid_request", "请求数据格式不正确，请返回重新排盘。",
      error instanceof Error ? error.message : String(error), 400);
  }

  if (!chart?.input) {
    return apiError("invalid_chart", "命盘数据缺失，请返回重新排盘。", undefined, 400);
  }

  if (shouldStaySilent(chart.input)) {
    return NextResponse.json(null);
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return apiError("missing_api_key",
      "未配置 GEMINI_API_KEY，请在 .env.local 中补充后重启开发服务器。");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
      systemInstruction: ziweiMasterSystemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        maxOutputTokens: 4096,
      } as never,
    });

    const result  = await model.generateContent(buildZiweiMasterUserPrompt(chart));
    const content = result.response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return apiError("invalid_model_json", "模型返回的 JSON 格式不正确，请重新生成一次。",
        error instanceof Error ? error.message : String(error));
    }

    if (!isZiweiMasterResponse(parsed)) {
      return apiError("invalid_model_schema", "模型返回内容缺少必要字段，请重新生成一次。");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ziwei-master] generate error:", msg);
    return apiError("model_request_failed",
      "AI 解读服务请求失败，请检查网络、额度或模型配置。", msg);
  }
}
