import { NextResponse } from "next/server";
import { createBaziChart, type BaziInput } from "@/app/bazi/chartEngine";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BaziInput;
    const chart = createBaziChart(payload);

    return NextResponse.json(chart);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "排盘失败，请稍后重试。"
      },
      { status: 400 }
    );
  }
}
