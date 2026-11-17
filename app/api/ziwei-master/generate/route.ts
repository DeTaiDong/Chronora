import { NextRequest, NextResponse } from "next/server";
import { requestDeepSeekCompletion, DeepSeekRequestError } from "@/lib/ai/deepseek-client";
import { DeepSeekOutputError, parseDeepSeekJsonResponse } from "@/lib/ai/parse-deepseek-response";
import { ziweiMasterSystemPrompt, buildZiweiMasterUserPrompt, shouldStaySilent } from "@/lib/ziwei-master";
import type { ZiweiChart } from "@/lib/ziwei/types";
import type { ZiweiMasterResponse } from "@/lib/ziwei-master/schema";

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
    Array.isArray(r.focusAreas) && r.focusAreas.every((area) => typeof area === "string") &&
    Array.isArray(r.cautions) && r.cautions.every((caution) => typeof caution === "string")
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

  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return apiError("missing_api_key",
      "未配置 DEEPSEEK_API_KEY，请在服务端环境变量中设置后重试。");
  }

  try {
    const result = await requestDeepSeekCompletion(
      apiKey,
      ziweiMasterSystemPrompt,
      buildZiweiMasterUserPrompt(chart),
    );
    let parsed: unknown;
    try {
      parsed = parseDeepSeekJsonResponse(result.content, result.finishReason);
    } catch (error) {
      const outputError = error instanceof DeepSeekOutputError ? error : null;
      console.error("[ziwei-master] invalid model output:", {
        code: outputError?.code ?? "unknown",
        finishReason: result.finishReason,
        responseChars: result.content?.length ?? 0,
        usage: result.usage,
      });
      const message = outputError?.code === "truncated"
        ? "AI 解读内容未完整生成，请重新尝试。"
        : "AI 返回内容格式不完整，请重新尝试解读。";
      return apiError("invalid_model_json", message, undefined, 502);
    }

    if (!isZiweiMasterResponse(parsed)) {
      return apiError("invalid_model_schema", "模型返回内容缺少必要字段，请重新生成一次。");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof DeepSeekRequestError) {
      console.error("[ziwei-master] DeepSeek request failed:", { status: error.status });
      return apiError("model_request_failed",
        "DeepSeek 请求失败，请检查 API Key、账户余额或模型配置。", undefined, 502);
    }
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ziwei-master] generate error:", msg);
    return apiError("model_request_failed",
      "DeepSeek 解读服务请求失败，请稍后重试。", undefined, 502);
  }
}
