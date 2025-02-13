import type { CoreMessage, Message, ToolSet } from "ai";

export type AiSdkMessages = CoreMessage[] | Omit<Message, "id">[];

export type AiSdkToolSet = ToolSet;
