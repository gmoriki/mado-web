import { NextResponse } from "next/server";
import { generateId, storeShare } from "@/lib/share-store";

export async function POST(request: Request) {
  try {
    const { markdown } = await request.json();
    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    const id = generateId();
    storeShare(id, markdown);

    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
