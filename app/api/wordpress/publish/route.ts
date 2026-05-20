import { NextRequest, NextResponse } from "next/server";
import { publishToWordPress } from "@/lib/wordpress";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string;
      content: string;
      status: "draft" | "publish";
      metaDescription?: string;
      tags?: string[];
      slug?: string;
      thumbnailUrl?: string;
    };

    const result = await publishToWordPress({
      title: body.title,
      content: body.content,
      status: body.status,
      excerpt: body.metaDescription,
      slug: body.slug,
      tagNames: body.tags,
      imageUrl: body.thumbnailUrl,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "WordPress 발행에 실패했습니다" },
      { status: 500 },
    );
  }
}
