type DeepSeekChoice = {
  finish_reason?: string | null;
  message?: { content?: string | null };
};

type DeepSeekCompletion = {
  choices?: DeepSeekChoice[];
  usage?: unknown;
};

export class DeepSeekRequestError extends Error {
  readonly status: number;
  readonly providerCode: string | null;
  readonly providerMessage: string | null;

  constructor(status: number, providerCode: string | null, providerMessage: string | null) {
    super(`DeepSeek API returned HTTP ${status}`);
    this.name = "DeepSeekRequestError";
    this.status = status;
    this.providerCode = providerCode;
    this.providerMessage = providerMessage;
  }
}

export async function requestDeepSeekCompletion(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 8192,
      thinking: { type: "disabled" },
      safety_check: { level: "high" },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    let providerCode: string | null = null;
    let providerMessage: string | null = null;
    try {
      const body = await response.json() as { error?: { code?: unknown; message?: unknown } };
      if (typeof body.error?.code === "string") providerCode = body.error.code.slice(0, 80);
      if (typeof body.error?.message === "string") {
        providerMessage = body.error.message
          .replaceAll(apiKey, "[redacted]")
          .replace(/(['"`]).*?\1/g, "[quoted value]")
          .slice(0, 200);
      }
    } catch {
      // Some upstream failures do not return JSON.
    }
    throw new DeepSeekRequestError(response.status, providerCode, providerMessage);
  }

  const completion = (await response.json()) as DeepSeekCompletion;
  const choice = completion.choices?.[0];

  return {
    content: choice?.message?.content ?? null,
    finishReason: choice?.finish_reason ?? null,
    usage: completion.usage,
  };
}
