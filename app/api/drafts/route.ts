import { NextRequest, NextResponse } from "next/server";
import { getAllDrafts, saveDraft, deleteDraft } from "@/lib/db";
import type { BlogState } from "@/lib/types";

export async function GET() {
  try {
    return NextResponse.json({ drafts: await getAllDrafts() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as BlogState;
    const draft = await saveDraft(data);
    return NextResponse.json({ draft });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = (await req.json()) as { id: string };
    const ok = await deleteDraft(id);
    return NextResponse.json({ success: ok });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
