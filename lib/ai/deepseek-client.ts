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

  constructor(status: number) {
    super(`DeepSeek API returned HTTP ${status}`);
    this.name = "DeepSeekRequestError";
    this.status = status;
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
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      safety_check: { level: "high" },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    throw new DeepSeekRequestError(response.status);
  }

  const completion = (await response.json()) as DeepSeekCompletion;
  const choice = completion.choices?.[0];

  return {
    content: choice?.message?.content ?? null,
    finishReason: choice?.finish_reason ?? null,
    usage: completion.usage,
  };
}
