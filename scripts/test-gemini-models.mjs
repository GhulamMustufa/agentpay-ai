import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envContent = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
}

const apiKey = env.GEMINI_API_KEY;
console.log("Testing Gemini with SDK and checking available models...");
console.log("Key prefix:", apiKey.substring(0, 10));

// 1. Try list models via REST
async function checkModels() {
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    if (!listRes.ok) {
      console.log("ListModels response status:", listRes.status, listData);
    } else {
      console.log("Available models:", listData.models?.map(m => m.name).slice(0, 10));
    }
  } catch (e) {
    console.error("ListModels fetch error:", e.message);
  }
}

// 2. Try SDK with gemini-2.0-flash, gemini-1.5-flash-latest, gemini-pro
async function trySdkModels() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro"
  ];

  for (const modelName of candidateModels) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("Hello! Reply with 'OK'");
      console.log(`✓ SUCCESS with ${modelName}:`, res.response.text());
      return;
    } catch (err) {
      console.log(`✗ ${modelName} failed:`, err.message?.substring(0, 120));
    }
  }
}

async function main() {
  await checkModels();
  await trySdkModels();
}

main();
