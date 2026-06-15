import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { fortuneMasterSystemPrompt, buildFortuneMasterUserPrompt } from "@/lib/fortune-master/prompt";
import { shouldStaySilent, isClearlyUnrelatedQuestion, fixedRefusalAnswer } from "@/lib/fortune-master/guard";
import type { BaziChart } from "@/app/bazi/chartEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

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

export async function POST(request: NextRequest) {
  try {
    const chart = (await request.json()) as BaziChart;

    if (shouldStaySilent(chart.input)) {
      return NextResponse.json(null);
    }

    if (isClearlyUnrelatedQuestion(chart.input.question)) {
      return NextResponse.json(fixedRefusalAnswer());
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      systemInstruction: fortuneMasterSystemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema
      } as never
    });

    const result = await model.generateContent(buildFortuneMasterUserPrompt(chart));
    const content = result.response.text();

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[fortune-master] generate error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
