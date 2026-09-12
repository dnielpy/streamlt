import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionPayload = {
  profileId: string;
  sessionVersion: number;
  issuedAt: number;
};

function signatureFor(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeSignedSession(payload: SessionPayload, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${signatureFor(encoded, secret)}`;
}

export function decodeSignedSession(value: string | undefined, secret: string) {
  if (!value) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = Buffer.from(signatureFor(encoded, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (
      typeof payload.profileId !== "string" ||
      !Number.isInteger(payload.sessionVersion) ||
      !Number.isFinite(payload.issuedAt)
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

