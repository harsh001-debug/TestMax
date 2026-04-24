import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, "../../.env");

function readDotEnvFile() {
  try {
    return fs.readFileSync(ENV_PATH, "utf8");
  } catch {
    return "";
  }
}

function parseDotEnv(raw) {
  return raw.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return accumulator;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return accumulator;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");
    accumulator[key] = value;
    return accumulator;
  }, {});
}

const fileEnv = parseDotEnv(readDotEnvFile());
const getEnv = (key, fallback = "") => {
  if (Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }

  if (Object.prototype.hasOwnProperty.call(fileEnv, key)) {
    return fileEnv[key];
  }

  return fallback;
};

export const env = {
  port: Number(getEnv("PORT", 3000)),
  jwtSecret: getEnv("JWT_SECRET", "change-me"),
  otpExpiryMinutes: Number(getEnv("OTP_EXPIRY_MINUTES", 10)),
  smtpDisable: String(getEnv("SMTP_DISABLE", "false")) === "true",
  smtpHost: getEnv("SMTP_HOST", ""),
  smtpPort: Number(getEnv("SMTP_PORT", 465)),
  smtpSecure: String(getEnv("SMTP_SECURE", "true")) === "true",
  smtpUser: getEnv("SMTP_USER", ""),
  smtpPass: getEnv("SMTP_PASS", ""),
  mailFrom: getEnv("MAIL_FROM", "Polytechnic Test Series <no-reply@example.com>"),
};
