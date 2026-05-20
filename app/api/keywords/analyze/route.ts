import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";

const SYSTEM = `당신은 한국어 블로그 SEO 전문가입니다.
주어진 키워드를 분석하고 최적의 글 유형을 추천해주세요.

글 유형:
- informational: 정보성 (개념 설명, 방법, 팁, 가이드)
- comparison: 비교형 (제품/서비스/방법 비교, 장단점 분석)
- issue-analysis: 이슈 분석형 (트렌드, 사건, 논란 분석)

반드시 아래 JSON 형식으로만 응답하세요:
{"articleType": "informational|comparison|issue-analysis", "reason": "추천 이유"}`;

export async function POST(req: NextRequest) {
  try {
    const { keyword, relatedKeywords } = await req.json() as {
      keyword: string;
      relatedKeywords: string[];
    };
    const prompt = `메인 키워드: "${keyword}"\n연관 키워드: ${relatedKeywords.join(", ")}`;
    const text = await callClaude(SYSTEM, prompt);
    const result = parseJson<{ articleType: string; reason: string }>(text);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
