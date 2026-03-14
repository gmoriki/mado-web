import { NextResponse } from "next/server";
import { getShare } from "@/lib/share-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const markdown = getShare(id);

  if (!markdown) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ markdown });
}
