import assert from "node:assert/strict";
import test from "node:test";
import { DeepSeekRequestError, requestDeepSeekCompletion } from "../lib/ai/deepseek-client.ts";
import { DeepSeekOutputError, parseDeepSeekJsonResponse } from "../lib/ai/parse-deepseek-response.ts";

test("parses a valid JSON response", () => {
  assert.deepEqual(parseDeepSeekJsonResponse('{"ok":true}', "stop"), { ok: true });
});

test("marks a length-limited response as truncated", () => {
  assert.throws(
    () => parseDeepSeekJsonResponse('{"ok":', "length"),
    (error) => error instanceof DeepSeekOutputError && error.code === "truncated",
  );
});

test("rejects malformed JSON", () => {
  assert.throws(
    () => parseDeepSeekJsonResponse("not json", "stop"),
    (error) => error instanceof DeepSeekOutputError && error.code === "invalid_json",
  );
});

test("rejects empty JSON-mode output", () => {
  assert.throws(
    () => parseDeepSeekJsonResponse("   ", "stop"),
    (error) => error instanceof DeepSeekOutputError && error.code === "empty",
  );
});

test("sends a server-authenticated JSON request and returns completion metadata", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl;
  let requestInit;

  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"ok":true}' }, finish_reason: "stop" }],
      usage: { total_tokens: 12 },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const result = await requestDeepSeekCompletion("test-secret", "system", "user");
    const body = JSON.parse(requestInit.body);

    assert.equal(requestUrl, "https://api.deepseek.com/chat/completions");
    assert.equal(requestInit.headers.Authorization, "Bearer test-secret");
    assert.equal(body.model, "deepseek-flash");
    assert.deepEqual(body.response_format, { type: "json_object" });
    assert.deepEqual(body.thinking, { type: "disabled" });
    assert.equal(JSON.stringify(body).includes("test-secret"), false);
    assert.deepEqual(result, {
      content: '{"ok":true}',
      finishReason: "stop",
      usage: { total_tokens: 12 },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("surfaces provider HTTP status without exposing the key", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 401 });

  try {
    await assert.rejects(
      requestDeepSeekCompletion("test-secret", "system", "user"),
      (error) => error instanceof DeepSeekRequestError && error.status === 401 && !error.message.includes("test-secret"),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
