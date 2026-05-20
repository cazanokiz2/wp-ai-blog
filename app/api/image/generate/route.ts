import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";
import { generateImage } from "@/lib/openai";
import { generateImageFree } from "@/lib/pollinations";
import { generateImageGemini } from "@/lib/gemini";

export const maxDuration = 60;

const PROMPT_SYSTEM = `당신은 블로그 썸네일 이미지 프롬프트 전문가입니다.
블로그 썸네일 이미지 프롬프트를 영어로 작성하세요.
프롬프트 원칙:
- 블로그 주제를 시각적으로 잘 표현
- 전문적이고 깔끔한 스타일
- 텍스트나 글자 포함 금지
- 3:2 가로형 비율에 적합한 구도
- 구체적이고 명확한 설명

반드시 아래 JSON 형식으로만 응답하세요:
{"prompt": "image generation prompt in English"}`;

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const diag: Record<string, unknown> = {
    gemini_key_set: !!geminiKey,
    gemini_key_prefix: geminiKey?.slice(0, 8) ?? "없음",
  };

  // Gemini API 직접 테스트
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey ?? "" },
        body: JSON.stringify({
          instances: [{ prompt: "a simple blue circle on white background" }],
          parameters: { sampleCount: 1, aspectRatio: "1:1" },
        }),
      },
    );
    if (res.ok) {
      const data = await res.json() as Record<string, unknown>;
      diag.gemini_status = "ok";
      diag.gemini_raw_keys = Object.keys(data);
      const preds = data.predictions as Array<Record<string, unknown>> | undefined;
      diag.gemini_pred_keys = preds?.[0] ? Object.keys(preds[0]) : [];
      diag.gemini_pred_sample = JSON.stringify(preds?.[0]).slice(0, 200);
    } else {
      const err = await res.text();
      diag.gemini_status = `http_${res.status}`;
      diag.gemini_error = err.slice(0, 300);
    }
  } catch (e) {
    diag.gemini_status = "exception";
    diag.gemini_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(diag);
}

export async function POST(req: NextRequest) {
  try {
    const { title, keyword, provider = "openai" } = (await req.json()) as {
      title: string;
      keyword: string;
      provider?: "openai" | "gemini" | "free";
    };

    const text = await callClaude(
      PROMPT_SYSTEM,
      `블로그 제목: "${title}"\n메인 키워드: "${keyword}"`,
      512,
    );
    const { prompt } = parseJson<{ prompt: string }>(text);
    const finalPrompt = `${prompt}, professional blog thumbnail, clean design, no text, no watermark, landscape 3:2 ratio`;

    if (provider === "free") {
      const imageUrl = generateImageFree(finalPrompt);
      return NextResponse.json({ imageUrl, prompt: finalPrompt, provider: "free" });
    }

    if (provider === "gemini") {
      try {
        const imageUrl = await generateImageGemini(finalPrompt);
        return NextResponse.json({ imageUrl, prompt: finalPrompt, provider: "gemini" });
      } catch (geminiErr) {
        console.warn("[image/generate] Gemini 실패, Pollinations로 전환:", geminiErr);
        const imageUrl = generateImageFree(finalPrompt);
        return NextResponse.json({ imageUrl, prompt: finalPrompt, provider: "free" });
      }
    }

    // OpenAI 시도, 실패 시 Pollinations로 자동 fallback
    try {
      const imageUrl = await generateImage(finalPrompt);
      return NextResponse.json({ imageUrl, prompt: finalPrompt, provider: "openai" });
    } catch (openaiErr) {
      console.warn("[image/generate] OpenAI 실패, Pollinations로 전환:", openaiErr);
      const imageUrl = generateImageFree(finalPrompt);
      return NextResponse.json({ imageUrl, prompt: finalPrompt, provider: "free" });
    }
  } catch (e) {
    console.error("[image/generate]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
