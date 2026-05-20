import { NextResponse } from "next/server";
import { checkWordPress } from "@/lib/wordpress";

export async function POST() {
  try {
    const result = await checkWordPress();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
