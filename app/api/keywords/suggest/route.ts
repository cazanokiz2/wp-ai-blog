import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";

const SYSTEM = `당신은 한국어 블로그 SEO 전문가입니다.
주어진 키워드와 관련된 연관 키워드 3개를 추천해주세요.
검색량이 높고 블로그 포스트에 적합한 키워드를 선택하세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"keywords": ["키워드1", "키워드2", "키워드3"]}`;

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json() as { keyword: string };
    const text = await callClaude(SYSTEM, `메인 키워드: "${keyword}"`);
    const { keywords } = parseJson<{ keywords: string[] }>(text);
    return NextResponse.json({ keywords });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
