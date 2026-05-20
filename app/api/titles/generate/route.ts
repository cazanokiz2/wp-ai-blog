import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";

const SYSTEMS: Record<string, string> = {
  informational: `당신은 한국어 SEO 블로그 제목 전문가입니다.
정보성 글 형식(방법, 가이드, 팁)으로 클릭률이 높은 SEO 최적화 제목 5개를 생성하세요.
각 제목은 40자 내외, 핵심 키워드 포함, 독자에게 명확한 가치를 전달해야 합니다.
SEO 점수(0-100)는 키워드 포함도, 클릭률, 검색 의도 부합도를 종합 평가합니다.
반드시 아래 JSON 형식으로만 응답하세요:
{"titles": [{"title": "제목", "seoScore": 85}]}`,
  comparison: `당신은 한국어 SEO 블로그 제목 전문가입니다.
비교형 글 형식(vs, 차이점, 비교)으로 클릭률이 높은 SEO 최적화 제목 5개를 생성하세요.
각 제목은 40자 내외, 핵심 키워드 포함, 비교 대상이 명확해야 합니다.
SEO 점수(0-100)는 키워드 포함도, 클릭률, 검색 의도 부합도를 종합 평가합니다.
반드시 아래 JSON 형식으로만 응답하세요:
{"titles": [{"title": "제목", "seoScore": 85}]}`,
  "issue-analysis": `당신은 한국어 SEO 블로그 제목 전문가입니다.
이슈 분석형 글 형식(트렌드, 원인, 전망)으로 클릭률이 높은 SEO 최적화 제목 5개를 생성하세요.
각 제목은 40자 내외, 핵심 키워드 포함, 최신성과 분석적 관점이 드러나야 합니다.
SEO 점수(0-100)는 키워드 포함도, 클릭률, 검색 의도 부합도를 종합 평가합니다.
반드시 아래 JSON 형식으로만 응답하세요:
{"titles": [{"title": "제목", "seoScore": 85}]}`,
};

export async function POST(req: NextRequest) {
  try {
    const { keyword, relatedKeywords = [], articleType } = await req.json() as {
      keyword: string;
      relatedKeywords?: string[];
      articleType: string;
    };
    const system = SYSTEMS[articleType] ?? SYSTEMS.informational;
    const relatedStr = relatedKeywords.length ? relatedKeywords.join(", ") : "없음";
    const prompt = `메인 키워드: "${keyword}"\n연관 키워드: ${relatedStr}\n글 유형: ${articleType}`;
    const text = await callClaude(system, prompt);
    const { titles } = parseJson<{ titles: Array<{ title: string; seoScore: number }> }>(text);
    return NextResponse.json({ titles });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
