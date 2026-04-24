import crypto from "node:crypto";
import { env } from "../config/env.js";

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
}

export async function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export async function compareOtp(otp, hash) {
  const left = Buffer.from(await hashOtp(otp), "hex");
  const right = Buffer.from(String(hash), "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
