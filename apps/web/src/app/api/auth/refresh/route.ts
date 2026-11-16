import { NextResponse } from "next/server";

/** Placeholder refresh handler — implement when backend JWT refresh is live. */
export async function POST() {
  return NextResponse.json(
    { error: { code: "NOT_IMPLEMENTED", message: "Refresh not wired yet." } },
    { status: 501 },
  );
}