import Anthropic from "@anthropic-ai/sdk";
import { Provider } from "../types.ts";
import { createAntropic } from "./anthropic.ts";
import { createOpenAIComp } from "./openai_comapatible.ts";

const providers: Record<string, () => Provider> = {
  anthropic: createAntropic,
  "anthropic-openai": () =>
    createOpenAIComp(
      "anthropic-openai",
      "https://api.anthropic.com/v1/ ",
      process.env.ANTHROPIC_API_KEY!,
      "claude-sonnet-5",
    ),
  groq: () =>
    createOpenAIComp(
      "groq",
      "https://api.groq.com/openai/v1",
      process.env.ANTHROPIC_API_KEY!,
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
