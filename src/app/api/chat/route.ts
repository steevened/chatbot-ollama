import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, type Message } from "ai";
import { z } from "zod";
// import { openai } from "@ai-sdk/openai";
// import OpenAI from "openai";
// import {} from "@ai-sdk/openai";

// const openai = new OpenAI({
//   baseURL: "http://localhost:11434/v1",
//   apiKey: "ollama",
// });

const PROMPT = `you're a helpful assistant`;

const openai = createOpenAI({
  // custom settings, e.g.
  // compatibility: "strict", // strict mode, enable when using the OpenAI API
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // const result = await openai.chat.completions.create({
  //   model: "llama3.1",
  //   stream: true,
  //   messages,
  //   // tools: [
  //   //   {
  //   //     type: "function",
  //   //     function: {
  //   //       function: getCurrentLocation,
  //   //       parameters: { type: "object", properties: {} },
  //   //     },
  //   //   },
  //   //   {
  //   //     type: "function",
  //   //     function: {
  //   //       function: getWeather,
  //   //       parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
  //   //       parameters: {
  //   //         type: "object",
  //   //         properties: {
  //   //           location: { type: "string" },
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  //   // ],
  // });

  const result = streamText({
    model: openai("llama3.1"),
    // prompt: PROMPT,
    messages,
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  for await (const textPart of result.textStream) {
    console.log(JSON.stringify(textPart));
  }
  return result.toDataStreamResponse();
}

// async function getCurrentLocation() {
//   return "Boston"; // Simulate lookup
// }

// async function getWeather(args: { location: string }) {
//   const { location } = args;
//   // … do lookup …
//   const temperature = 123;
//   const precipitation = 123;
//   return { temperature, precipitation };
// }
