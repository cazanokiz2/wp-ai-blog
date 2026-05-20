import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";

const SYSTEMS: Record<string, string> = {
  informational: `당신은 한국어 블로그 전문 작가입니다.
정보성 글 형식으로 SEO 최적화된 블로그 포스트를 작성하세요.
작성 원칙:
- 2,000자 내외의 마크다운 형식
- 친근하고 이해하기 쉬운 문체
- 핵심 키워드를 자연스럽게 본문에 포함 (3-5회)
- 독자에게 실질적이고 구체적인 정보 제공
- 각 섹션은 목차 구조에 맞게 ## (H2), ### (H3) 헤딩 사용
- 목록, 강조 등 마크다운 요소를 적절히 활용
- 서론에서 독자의 관심을 끌고 결론에서 핵심 내용 요약`,
  comparison: `당신은 한국어 블로그 전문 작가입니다.
비교형 글 형식으로 SEO 최적화된 블로그 포스트를 작성하세요.
작성 원칙:
- 2,000자 내외의 마크다운 형식
- 객관적이고 균형잡힌 비교 분석
- 비교 대상의 장단점을 명확히 제시
- 표나 목록으로 비교 내용을 시각적으로 정리
- 독자가 최적의 선택을 할 수 있도록 가이드
- 각 섹션은 ## (H2), ### (H3) 헤딩 사용`,
  "issue-analysis": `당신은 한국어 블로그 전문 작가입니다.
이슈 분석형 글 형식으로 SEO 최적화된 블로그 포스트를 작성하세요.
작성 원칙:
- 2,000자 내외의 마크다운 형식
- 현재 트렌드와 이슈를 심층 분석
- 원인, 현황, 전망을 논리적으로 설명
- 다양한 관점에서 균형있게 분석
- 독자가 이슈를 이해하고 자신의 관점을 형성할 수 있도록 지원
- 각 섹션은 ## (H2), ### (H3) 헤딩 사용`,
};

export async function POST(req: NextRequest) {
  try {
    const { title, keyword, outline, articleType } = await req.json() as {
      title: string;
      keyword: string;
      outline: Array<{ level: string; text: string }>;
      articleType: string;
    };

    const outlineText = outline
      .map((item) => `${item.level === "h2" ? "## " : "### "}${item.text}`)
      .join("\n");

    const system = SYSTEMS[articleType] ?? SYSTEMS.informational;
    const prompt = `블로그 제목: "${title}"
메인 키워드: "${keyword}"
글 유형: ${articleType}

목차 구조:
${outlineText}

위 목차 구조에 맞게 완전한 블로그 포스트를 마크다운 형식으로 작성해주세요.
제목(# 헤딩)은 포함하지 말고 본문부터 시작하세요.`;

    const content = await callClaude(system, prompt, 6000);
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
