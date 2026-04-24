import crypto from "node:crypto";

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function comparePassword(password, storedValue) {
  const [salt, existingHash] = String(storedValue || "").split(":");
  if (!salt || !existingHash) {
    return false;
  }

  const calculatedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const left = Buffer.from(existingHash, "hex");
  const right = Buffer.from(calculatedHash, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
