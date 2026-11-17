export type DeepSeekOutputErrorCode = "truncated" | "empty" | "invalid_json";

export class DeepSeekOutputError extends Error {
  readonly code: DeepSeekOutputErrorCode;

  constructor(code: DeepSeekOutputErrorCode) {
    super(code);
    this.name = "DeepSeekOutputError";
    this.code = code;
  }
}

export function parseDeepSeekJsonResponse(content: string | null | undefined, finishReason: string | null) {
  if (finishReason === "length") {
    throw new DeepSeekOutputError("truncated");
  }

  if (!content?.trim()) {
    throw new DeepSeekOutputError("empty");
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new DeepSeekOutputError("invalid_json");
  }
}
