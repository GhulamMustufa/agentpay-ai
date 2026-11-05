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

async function checkDetails() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  for (const m of data.models || []) {
    console.log(`Model: ${m.name}`);
    console.log(`  Methods: ${JSON.stringify(m.supportedGenerationMethods)}`);
  }
}

checkDetails();
