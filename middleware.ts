// middleware.ts — keep everything public
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// No matcher = do nothing for all routes (fully public)
// If you already had a config with matchers, delete it.
