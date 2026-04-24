import net from "node:net";
import tls from "node:tls";
import { env } from "../config/env.js";

function hasSmtpConfig() {
  return !env.smtpDisable && Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

function getSenderAddress() {
  const match = env.mailFrom.match(/<([^>]+)>/);
  return match ? match[1] : env.smtpUser;
}

function createSocket() {
  return new Promise((resolve, reject) => {
    if (!env.smtpSecure) {
      reject(new Error("This zero-dependency SMTP client expects SMTP_SECURE=true."));
      return;
    }

    const socket = tls.connect(
      {
        host: env.smtpHost,
        port: env.smtpPort,
        servername: env.smtpHost,
      },
      () => resolve(socket),
    );

    socket.setEncoding("utf8");
    socket.once("error", reject);
  });
}

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const onData = (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/).filter(Boolean);

      if (lines.length && /^\d{3} /.test(lines[lines.length - 1])) {
        cleanup();
        resolve(lines);
      }
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function sendCommand(socket, command, expectedCodes) {
  socket.write(`${command}\r\n`);
  const lines = await readResponse(socket);
  const code = Number(lines[lines.length - 1].slice(0, 3));

  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed for "${command}": ${lines.join(" | ")}`);
  }

  return lines;
}

function buildPlainMessage({ email, name, otp, subject, intro, expiresInMinutes }) {
  return [
    `From: ${env.mailFrom}`,
    `To: ${email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    `Hello ${name},`,
    "",
    intro,
    `OTP: ${otp}`,
    `Valid for: ${expiresInMinutes} minutes`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\r\n");
}

async function sendOtpMail({ email, name, otp, subject, intro, expiresInMinutes }) {
  if (!hasSmtpConfig()) {
    console.log(`[OTP][DEV] ${email} => ${otp}`);
    return { delivered: false, previewOtp: otp };
  }

  const socket = await createSocket();

  try {
    const greeting = await readResponse(socket);
    if (!greeting.length || !greeting[greeting.length - 1].startsWith("220")) {
      throw new Error(`SMTP greeting failed: ${greeting.join(" | ")}`);
    }

    await sendCommand(socket, "EHLO localhost", [250]);
    await sendCommand(socket, "AUTH LOGIN", [334]);
    await sendCommand(socket, Buffer.from(env.smtpUser).toString("base64"), [334]);
    await sendCommand(socket, Buffer.from(env.smtpPass).toString("base64"), [235]);
    await sendCommand(socket, `MAIL FROM:<${getSenderAddress()}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${email}>`, [250, 251]);
    await sendCommand(socket, "DATA", [354]);

    const message = buildPlainMessage({
      email,
      name,
      otp,
      subject,
      intro,
      expiresInMinutes,
    });

    socket.write(`${message}\r\n.\r\n`);
    const dataResponse = await readResponse(socket);
    const code = Number(dataResponse[dataResponse.length - 1].slice(0, 3));
    if (code !== 250) {
      throw new Error(`SMTP DATA failed: ${dataResponse.join(" | ")}`);
    }

    await sendCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }

  return { delivered: true, previewOtp: null };
}

export function sendSignupOtpEmail({ email, name, otp, expiresInMinutes }) {
  return sendOtpMail({
    email,
    name,
    otp,
    expiresInMinutes,
    subject: "Polytechnic Test Series signup OTP",
    intro: "Use this one-time password to verify your new account.",
  });
}

export function sendLoginOtpEmail({ email, name, otp, expiresInMinutes }) {
  return sendOtpMail({
    email,
    name,
    otp,
    expiresInMinutes,
    subject: "Polytechnic Test Series login OTP",
    intro: "Use this one-time password to complete your login.",
  });
}
