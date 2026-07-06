import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Returns a 401 response if the caller is not the authenticated admin,
 *  otherwise null (meaning: proceed). Used to guard mutating API routes. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}
