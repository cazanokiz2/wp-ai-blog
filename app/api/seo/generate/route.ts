import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";

const SYSTEM = `당신은 한국어 블로그 SEO 전문가입니다.
주어진 블로그 제목과 본문을 분석하여 SEO 요소를 생성하세요.

생성 기준:
- 메타디스크립션: 120-160자, 핵심 키워드 포함, 클릭을 유도하는 문구
- 태그: 핵심 키워드와 연관 키워드 5개, 쉼표 없이 별도 항목으로
- URL 슬러그: 영문 소문자와 하이픈만 사용, 핵심 키워드를 영어로 변환

반드시 아래 JSON 형식으로만 응답하세요:
{"metaDescription": "160자 이내 설명", "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"], "slug": "url-slug-here"}`;

export async function POST(req: NextRequest) {
  try {
    const { title, content, keyword } = await req.json() as {
      title: string;
      content: string;
      keyword: string;
    };
    const prompt = `블로그 제목: "${title}"\n메인 키워드: "${keyword}"\n\n본문 (처음 500자):\n${content.slice(0, 500)}`;
    const text = await callClaude(SYSTEM, prompt);
    const result = parseJson<{ metaDescription: string; tags: string[]; slug: string }>(text);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
