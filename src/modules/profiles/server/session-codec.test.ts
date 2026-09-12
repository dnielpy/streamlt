import { describe, expect, it } from "vitest";
import { decodeSignedSession, encodeSignedSession } from "@/src/modules/profiles/server/session-codec";

describe("signed profile sessions", () => {
  const secret = "test-secret-that-is-not-used-in-production";
  const payload = { profileId: "profile-1", sessionVersion: 3, issuedAt: 12345 };

  it("round-trips a valid payload", () => {
    expect(decodeSignedSession(encodeSignedSession(payload, secret), secret)).toEqual(payload);
  });

  it("rejects tampered payloads and signatures", () => {
    const session = encodeSignedSession(payload, secret);
    const [encoded, signature] = session.split(".");
    expect(decodeSignedSession(`${encoded.slice(0, -1)}A.${signature}`, secret)).toBeNull();
    expect(decodeSignedSession(`${encoded}.${signature.slice(0, -1)}A`, secret)).toBeNull();
    expect(decodeSignedSession(session, "another-secret")).toBeNull();
  });
});

