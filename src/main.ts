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

const apiKey = process.env.GROK_API_KEY;

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const stream = await client.chat.completions.create({
  model: values.model,
  messages: [{ role: "user", content: values.prompt }],
  max_tokens: 1024,
  stream: true,
});

for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content;

  if (typeof text === "string") {
    process.stdout.write(text);
  }
}

console.log();
