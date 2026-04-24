import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const STORE_PATH = path.join(DATA_DIR, "app-data.json");

const EMPTY_STORE = {
  users: [],
  otpRequests: [],
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(raw);

  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    otpRequests: Array.isArray(parsed.otpRequests) ? parsed.otpRequests : [],
  };
}

export async function writeStore(store) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}
