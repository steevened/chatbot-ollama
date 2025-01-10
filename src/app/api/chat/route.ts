import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { LangChainAdapter, type Message } from "ai";

const PROMPT = `you're a helpful assistant`;

const systemMessage = new SystemMessage(PROMPT);

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const model = new ChatOllama({
    checkOrPullModel: true,
    model: "mistral",
    temperature: 0.1,
  });

  const result = await model.stream([
    // systemMessage,
    ...messages.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
  ]);

  return LangChainAdapter.toDataStreamResponse(result);
}
