import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/claude";

const SYSTEM = `당신은 한국어 블로그 콘텐츠 전문가입니다.
주어진 제목과 키워드에 맞는 목차를 H2, H3 구조로 생성하세요.
H2는 주요 섹션(4-6개), H3는 각 H2 아래 세부 항목(1-3개)입니다.
SEO에 최적화되고 독자가 읽고 싶어하는 논리적인 흐름으로 구성하세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"outline": [{"level": "h2", "text": "섹션 제목"}, {"level": "h3", "text": "세부 항목"}]}`;

export async function POST(req: NextRequest) {
  try {
    const { title, keyword, articleType } = await req.json() as {
      title: string;
      keyword: string;
      articleType: string;
    };
    const prompt = `블로그 제목: "${title}"\n메인 키워드: "${keyword}"\n글 유형: ${articleType}`;
    const text = await callClaude(SYSTEM, prompt);
    const { outline } = parseJson<{ outline: Array<{ level: string; text: string }> }>(text);
    const items = outline.map((item, i) => ({
      id: `item-${i}-${Date.now()}`,
      level: item.level as "h2" | "h3",
      text: item.text,
    }));
    return NextResponse.json({ outline: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
