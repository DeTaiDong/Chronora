import { NextResponse } from "next/server";
import { buildZiweiChart } from "@/lib/ziwei/engine";
import type { ZiweiInput } from "@/lib/ziwei/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ZiweiInput;
    const chart = buildZiweiChart(payload);
    return NextResponse.json(chart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "紫微排盘失败，请稍后重试。" },
      { status: 400 },
    );
  }
}
