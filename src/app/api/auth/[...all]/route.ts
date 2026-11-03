import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { AuthConfigurationError, getAuth } from "@/lib/auth";

async function dispatch(request: Request, method: "GET" | "POST") {
  try {
    const handler = toNextJsHandler(getAuth())[method];
    return await handler(request);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Authentication request failed:", error);
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export const GET = (request: Request) => dispatch(request, "GET");
export const POST = (request: Request) => dispatch(request, "POST");
