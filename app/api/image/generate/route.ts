import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";
import { generateImage } from "@/lib/openai";

export const maxDuration = 60;

const PROMPT_SYSTEM = `당신은 블로그 썸네일 이미지 프롬프트 전문가입니다.
gpt-image-1 모델로 생성할 블로그 썸네일 이미지 프롬프트를 영어로 작성하세요.
프롬프트 원칙:
- 블로그 주제를 시각적으로 잘 표현
- 전문적이고 깔끔한 스타일
- 텍스트나 글자 포함 금지
- 3:2 가로형 비율에 적합한 구도
- 구체적이고 명확한 설명

반드시 아래 JSON 형식으로만 응답하세요:
{"prompt": "image generation prompt in English"}`;

export async function POST(req: NextRequest) {
  try {
    const { title, keyword } = (await req.json()) as {
      title: string;
      keyword: string;
    };

    const text = await callClaude(
      PROMPT_SYSTEM,
      `블로그 제목: "${title}"\n메인 키워드: "${keyword}"`,
      512,
    );
    const { prompt } = parseJson<{ prompt: string }>(text);

    const finalPrompt = `${prompt}, professional blog thumbnail, clean design, no text, no watermark, landscape 3:2 ratio`;
    const b64 = await generateImage(finalPrompt);

    const imageUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ imageUrl, prompt: finalPrompt });
  } catch (e) {
    console.error("[image/generate]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
