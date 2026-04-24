import crypto from "node:crypto";
import { env } from "../config/env.js";

function base64urlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signAuthToken(user) {
  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64urlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }),
  );
  const signature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifyAuthToken(token) {
  const [header, payload, signature] = String(token || "").split(".");

  if (!header || !payload || !signature) {
    throw new Error("Invalid token shape.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    throw new Error("Invalid token signature.");
  }

  const decoded = JSON.parse(base64urlDecode(payload));
  if (!decoded.exp || decoded.exp < Date.now()) {
    throw new Error("Token expired.");
  }

  return decoded;
}
