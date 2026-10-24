import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

export function createAssistant(model: `${string}/${string}`) {
  return new Agent({
    id: "tontu-assistant",
    name: "Tontu Assistant",
    instructions:
      "You are Tontu's helpful assistant. Give clear and concise answers.",
    model,
    memory: new Memory({
      options: { lastMessages: 20, semanticRecall: false },
    }),
  });
}
