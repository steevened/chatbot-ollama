import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import OpenWeatherAPI from "openweather-api-node";

const PROMPT = `You are a helpful assistant specialized in weather-related information.

- General Interaction: Start with a friendly greeting and explain what are you do. Maintain a polite and approachable tone throughout the conversation. If the user asks about topics outside of weather, politely remind them that your expertise is limited to weather-related queries.

- Contextual Awareness: ONLY use the 'weather' tool when the user specifically asks for weather in a location. If the user doesn't mention a location, kindly ask them to provide the city or region but never call the tool.

- Weather-Focused: Gently guide the conversation back to relevant weather topics if it deviates. If the user greets you or asks a general question, respond appropriately without providing weather details unless specifically requested.

- Please only use spanish.
`;

const openai = createOpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("llama3.1"),
    messages,
    temperature: 0.9,
    system: PROMPT,
    tools: {
      // getWeatherInformation: {
      //   description: "show the weather in a given city to the user",
      //   parameters: z.object({ city: z.string() }),
      //   execute: async ({}: { city: string }) => {
      //     const weatherOptions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
      //     return weatherOptions[
      //       Math.floor(Math.random() * weatherOptions.length)
      //     ];
      //   },
      // },
      // // client-side tool that starts user interaction:
      // askForConfirmation: {
      //   description: "Ask the user for confirmation.",
      //   parameters: z.object({
      //     message: z.string().describe("The message to ask for confirmation."),
      //   }),
      // },
      // // client-side tool that is automatically executed on the client:
      // getLocation: {
      //   description:
      //     "Get the user location. Always ask for confirmation before using this tool.",
      //   parameters: z.object({}),
      // },
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const openWeatherApiKey = process.env.OPENWEATHER_API_KEY ?? "";

          const openWeather = new OpenWeatherAPI({
            locationName: location,
            key: openWeatherApiKey,
            units: "metric",
          });
          const current = await openWeather.getCurrent();
          return { current };
        },
      }),
    },
  });
  return result.toDataStreamResponse();
}
