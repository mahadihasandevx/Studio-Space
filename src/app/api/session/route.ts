import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AuthConfigurationError, getAuth } from "@/lib/auth";

const cookieName = "studiospace_session";
const maxAge = 60 * 60 * 24 * 7;

export async function POST() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Session signing is not configured. Set JWT_SECRET in studiospace-client/.env." },
      { status: 503 },
    );
  }

  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    const token = jwt.sign(
      {
        sub: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      },
      secret,
      { expiresIn: maxAge },
    );
    const response = NextResponse.json({ data: { authenticated: true } });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
    return response;
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Could not create the API session:", error);
    return NextResponse.json(
      { error: "Your session could not be established. Please sign in again." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
