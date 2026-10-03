import { readFile } from "node:fs/promises";
import { Tool } from "../types.ts";
import { resolve } from "node:path";

export const readTool: Tool = {
  name: "read",
  description: "read a text file and return its contents",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the file, relative to current folder",
      },
    },
    required: ["path"],
  },
  async execute(args) {
    return readFile(resolve(process.cwd(), String(args.path)), "utf8");
  },
};
