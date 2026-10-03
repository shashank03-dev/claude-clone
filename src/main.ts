import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { parseArgs } from "node:util";
import { getProvider } from "./PROVIDER/index.ts";
import { readTool } from "./tools/read.ts";
import type { AssistantMessage, Message } from "./types.ts";

const tools = [readTool];

config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const { values } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    model: { type: "string" },
    provider: { type: "string", default: "groq" },
  },
});

if (!values.prompt) {
  console.log("prompt he nhi hain");
  process.exit(1);
}

const provider = getProvider(values.provider);

const model = values.model ?? provider.defaultModel;

const messages: Message[] = [{ role: "user", content: values.prompt }];

async function callModel(): Promise<AssistantMessage> {
  for await (const event of provider.stream({ messages, model, tools })) {
    if (event.type == "text_delta") process.stdout.write(event.delta);
    else {
      const { usage, stopReason } = event.message;
      console.log(
        `\n\n  ${provider.name} ....  ${model} ... ${usage.input} ... ${usage.output} ... ${stopReason}`,
      );
      return event.message;
    }
  }
  throw new Error("stream ended");
}

const first = await callModel();
messages.push(first);
if (first.stopReason === "toolUse") {
  for (const block of first.content) {
    if (block.type !== "toolCall") continue;
    console.log(`-> ${block.name}(${JSON.stringify(block.arguments)})`);
    const result = await readTool.execute(block.arguments);
    messages.push({
      role: "toolResult",
      toolCallId: block.id,
      toolName: block.name,
      content: result,
      isError: false,
    });
  }
  messages.push(await callModel());
}

// for await (const event of provider.stream({ messages, model })) {
//   if (event.type === "text_delta") process.stdout.write(event.delta);
//   else {
//     const { usage, stopReason } = event.message;
//     console.log(
//       `\n\n ${provider.name} ... ${model} ...  ${usage.input}...  ${usage.output}...  ${stopReason}`,
//     );
//   }
// }

// const apiKey = process.env.GROK_API_KEY;

// const client = new OpenAI({
//   apiKey,
//   baseURL: "https://api.groq.com/openai/v1",
// });

// const stream = await client.chat.completions.create({
//   model: values.model,
//   messages: [{ role: "user", content: values.prompt }],
//   max_tokens: 1024,
//   stream: true,
// });

// for await (const chunk of stream) {
//   const text = chunk.choices[0]?.delta?.content;

//   if (typeof text === "string") {
//     process.stdout.write(text);
//   }
// }

// console.log();
