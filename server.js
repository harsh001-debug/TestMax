import crypto from "node:crypto";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./src/config/env.js";
import { sendLoginOtpEmail, sendSignupOtpEmail } from "./src/lib/email.js";
import { compareOtp, generateOtpCode, getOtpExpiryDate, hashOtp } from "./src/lib/otp.js";
import { comparePassword, hashPassword } from "./src/lib/passwords.js";
import { readStore, writeStore } from "./src/lib/store.js";
import { signAuthToken, verifyAuthToken } from "./src/lib/tokens.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    goal: user.goal,
    createdAt: user.createdAt,
  };
}

function findLatestOtp(store, email, purpose) {
  return store.otpRequests
    .filter((entry) => entry.email === email && entry.purpose === purpose && !entry.consumedAt)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
}

function invalidateOtps(store, email, purpose) {
  for (const entry of store.otpRequests) {
    if (entry.email === email && entry.purpose === purpose && !entry.consumedAt) {
      entry.consumedAt = new Date().toISOString();
    }
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    const store = await readStore();
    return store.users.find((entry) => entry.id === payload.sub) || null;
  } catch {
    return null;
  }
}

async function serveFile(res, fileName, contentType) {
  const filePath = path.join(__dirname, fileName);
  const content = await fs.readFile(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

async function handleSignupOtp(req, res) {
  const body = await readJsonBody(req);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const goal = String(body.goal || "").trim();
  const password = String(body.password || "");

  if (!name || !email || !goal || !password) {
    return sendJson(res, 400, { message: "Name, email, goal, and password are required." });
  }

  if (password.length < 8) {
    return sendJson(res, 400, { message: "Password must be at least 8 characters long." });
  }

  const store = await readStore();
  if (store.users.some((entry) => entry.email === email)) {
    return sendJson(res, 409, { message: "An account already exists for this email." });
  }

  const otp = generateOtpCode();
  const expiresAt = getOtpExpiryDate();

  invalidateOtps(store, email, "signup");
  store.otpRequests.push({
    id: crypto.randomUUID(),
    email,
    purpose: "signup",
    otpHash: await hashOtp(otp),
    expiresAt: expiresAt.toISOString(),
    consumedAt: null,
    createdAt: new Date().toISOString(),
    pendingUser: {
      name,
      email,
      goal,
      passwordHash: await hashPassword(password),
    },
  });

  await writeStore(store);

  const mail = await sendSignupOtpEmail({
    email,
    name,
    otp,
    expiresInMinutes: env.otpExpiryMinutes,
  });

  return sendJson(res, 201, {
    message: "Signup OTP sent successfully.",
    expiresAt: expiresAt.toISOString(),
    ...(mail.previewOtp ? { previewOtp: mail.previewOtp } : {}),
  });
}

async function handleSignupVerify(req, res) {
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const otp = String(body.otp || "").trim();

  if (!email || !otp) {
    return sendJson(res, 400, { message: "Email and OTP are required." });
  }

  const store = await readStore();
  const otpEntry = findLatestOtp(store, email, "signup");

  if (!otpEntry || new Date(otpEntry.expiresAt).getTime() <= Date.now()) {
    return sendJson(res, 400, { message: "OTP expired or not found. Please request a new one." });
  }

  if (!(await compareOtp(otp, otpEntry.otpHash))) {
    return sendJson(res, 400, { message: "Invalid OTP." });
  }

  if (!otpEntry.pendingUser || store.users.some((entry) => entry.email === email)) {
    return sendJson(res, 409, { message: "An account already exists for this email." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: otpEntry.pendingUser.name,
    email: otpEntry.pendingUser.email,
    goal: otpEntry.pendingUser.goal,
    passwordHash: otpEntry.pendingUser.passwordHash,
    createdAt: new Date().toISOString(),
  };

  otpEntry.consumedAt = new Date().toISOString();
  store.users.push(user);
  await writeStore(store);

  return sendJson(res, 201, {
    message: "Account created successfully.",
    token: signAuthToken(user),
    user: sanitizeUser(user),
  });
}

async function handleLoginOtp(req, res) {
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return sendJson(res, 400, { message: "Email and password are required." });
  }

  const store = await readStore();
  const user = store.users.find((entry) => entry.email === email);

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return sendJson(res, 401, { message: "Invalid email or password." });
  }

  const otp = generateOtpCode();
  const expiresAt = getOtpExpiryDate();

  invalidateOtps(store, email, "login");
  store.otpRequests.push({
    id: crypto.randomUUID(),
    email,
    purpose: "login",
    otpHash: await hashOtp(otp),
    expiresAt: expiresAt.toISOString(),
    consumedAt: null,
    createdAt: new Date().toISOString(),
    pendingUser: null,
  });

  await writeStore(store);

  const mail = await sendLoginOtpEmail({
    email,
    name: user.name,
    otp,
    expiresInMinutes: env.otpExpiryMinutes,
  });

  return sendJson(res, 201, {
    message: "Login OTP sent successfully.",
    expiresAt: expiresAt.toISOString(),
    ...(mail.previewOtp ? { previewOtp: mail.previewOtp } : {}),
  });
}

async function handleLoginVerify(req, res) {
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const otp = String(body.otp || "").trim();

  if (!email || !otp) {
    return sendJson(res, 400, { message: "Email and OTP are required." });
  }

  const store = await readStore();
  const user = store.users.find((entry) => entry.email === email);
  const otpEntry = findLatestOtp(store, email, "login");

  if (!user) {
    return sendJson(res, 401, { message: "Account not found." });
  }

  if (!otpEntry || new Date(otpEntry.expiresAt).getTime() <= Date.now()) {
    return sendJson(res, 400, { message: "OTP expired or not found. Please request a new one." });
  }

  if (!(await compareOtp(otp, otpEntry.otpHash))) {
    return sendJson(res, 400, { message: "Invalid OTP." });
  }

  otpEntry.consumedAt = new Date().toISOString();
  await writeStore(store);

  return sendJson(res, 200, {
    message: "Login successful.",
    token: signAuthToken(user),
    user: sanitizeUser(user),
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        service: "team-testmax",
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signup/request-otp") {
      return await handleSignupOtp(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signup/verify") {
      return await handleSignupVerify(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login/request-otp") {
      return await handleLoginOtp(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login/verify") {
      return await handleLoginVerify(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/auth/me") {
      const user = await getAuthenticatedUser(req);

      if (!user) {
        return sendJson(res, 401, { message: "Authentication required." });
      }

      return sendJson(res, 200, { user: sanitizeUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/") {
      return await serveFile(res, "index.html", "text/html; charset=utf-8");
    }

    if (req.method === "GET" && url.pathname === "/app.js") {
      return await serveFile(res, "app.js", "application/javascript; charset=utf-8");
    }

    if (req.method === "GET" && url.pathname === "/styles.css") {
      return await serveFile(res, "styles.css", "text/css; charset=utf-8");
    }

    return sendJson(res, 404, { message: "Route not found." });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { message: "Internal server error." });
  }
});

server.listen(env.port, () => {
  console.log(`Team TestMax running at http://localhost:${env.port}`);
});
