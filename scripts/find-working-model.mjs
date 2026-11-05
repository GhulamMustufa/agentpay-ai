import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const models = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
];

async function testAll() {
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello! Reply with OK" }] }]
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✓ Model ${m} is WORKING! Reply:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      } else {
        console.log(`✗ Model ${m} status ${res.status}:`, data.error?.message?.substring(0, 80));
      }
    } catch (err) {
      console.log(`✗ Model ${m} error:`, err.message);
    }
  }
}

testAll();
