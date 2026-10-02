import Anthropic from "@anthropic-ai/sdk";
import { Provider } from "../types.ts";
import { createAntropic } from "./anthropic.ts";
import { createOpenAIComp } from "./openai_comapatible.ts";

const providers: Record<string, () => Provider> = {
  anthropic: createAntropic,
  "anthropic-openai": () =>
    createOpenAIComp(
      "anthropic-openai",
      process.env.GROK_API_KEY!,
      "http://api.openai.com/v1",
      "claude-sonnet-5",
    ),
  groq: () =>
    createOpenAIComp(
      "groq",
      process.env.GROK_API_KEY!,
      "https://api.groq.com/openai/v1",
      "openai/gpt-oss-120b",
    ),
};

export function getProvider(name: string): Provider {
  const create = providers[name];
  if (!create) {
    throw new Error("this provider is not set");
  }
  return create();
}
