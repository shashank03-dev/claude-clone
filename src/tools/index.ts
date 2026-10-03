import { readTool } from "./read.ts";
import { Tool } from "../types.ts";
import { bashTool } from "./bash.ts";
export const tools: Tool[] = [bashTool, readTool];
