import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { parseArgs } from "node:util";

config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const { values } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    model: { type: "string", default: "openai/gpt-oss-120b" },
  },
});

if (!values.prompt) {
  console.log("prompt he nhi hain");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const message = await client.chat.completions.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: values.prompt }],
  model: values.model,
});

console.log(message.choices);
