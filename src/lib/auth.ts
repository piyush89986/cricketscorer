import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import connectToDatabase from "./mongodb";
import User, { IUser } from "@/models/User";

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  // Check cookie
  let token = req.cookies.get("cricscore_token")?.value;

  // Check Authorization header
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(req: NextRequest): Promise<{ user: JWTPayload | null; errorResponse?: NextResponse }> {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 }),
    };
  }
  return { user };
}

export async function requireRole(req: NextRequest, allowedRoles: string[]): Promise<{ user: JWTPayload | null; errorResponse?: NextResponse }> {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return { user: null, errorResponse };

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles.` },
        { status: 403 }
      ),
    };
  }

  return { user };
}
