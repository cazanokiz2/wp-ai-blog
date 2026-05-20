import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = "claude-sonnet-4-6";

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096,
): Promise<string> {
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const message = await stream.finalMessage();
  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}

export function parseJson<T>(text: string): T {
  // 1) ```json ... ``` 블록 우선 시도
  const mdMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1]) as T; } catch { /* fall through */ }
  }

  // 2) 가장 바깥쪽 { } 추출 (중첩 대괄호 고려)
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) as T; } catch { /* fall through */ }
  }

  // 3) 배열 형태 시도
  const aStart = text.indexOf("[");
  const aEnd   = text.lastIndexOf("]");
  if (aStart !== -1 && aEnd > aStart) {
    try { return JSON.parse(text.slice(aStart, aEnd + 1)) as T; } catch { /* fall through */ }
  }

  // 4) 원본 그대로 파싱 (실패 시 원인 텍스트 포함한 에러)
  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.slice(0, 300).replace(/\n/g, "↵");
    throw new Error(`JSON 파싱 실패. Claude 응답 앞부분: "${preview}"`);
  }
}
