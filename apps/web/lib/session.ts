"use server"

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  user: {
    id: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY!;

const encodeKey = new TextEncoder().encode(secretKey)

export async function createSession(payload: Session) {
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodeKey);

  cookies().set("session", session, {
    httpOnly: true,
    expires: expiredAt,
    sameSite: "lax",
    secure: true,
    path: "/"
  })
}

export async function getSession() {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodeKey, {
      algorithms: ["HS256"]
    });

    return payload as Session;
  } catch (err) {
    console.error("Failed to verify the session", err);
    redirect("/auth/signin")
  }
}

export async function deleteSession() {
  try {
    await cookies().delete("session");
  } catch (err) {
    console.error("Failed to delete the session", err);
  }
}

export async function updateTokens({
  accessToken,
  refreshToken
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return null;

  const { payload } = await jwtVerify<Session>(cookie, encodeKey);

  if (!payload) throw new Error("Session not found");

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  }

  await createSession(newPayload);

}

// export async function deleteSession() {
//   await cookies().delete("session");
// }