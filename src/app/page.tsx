"use client";

import { ToolInvocation } from "ai";
import { useChat } from "ai/react";

export default function ChatbotUI() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === "getLocation") {
          const cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "San Francisco",
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.content}
              {/* <div key={message.id} className="flex flex-row gap-2">
                <div className="w-24 text-zinc-500">{`${
                  message.toolInvocations ? "tool" : message.role
                }: `}</div>
                <div className="w-full">
                  {message.toolInvocations
                    ? message.toolInvocations.map(
                        (tool) =>
                          `${tool.toolName}(${JSON.stringify(tool.args)})`
                      )
                    : message.content}
                </div>
              </div> */}
              {/* {message.content} */}
              {message.toolInvocations?.map(
                (toolInvocation: ToolInvocation) => {
                  const toolCallId = toolInvocation.toolCallId;
                  const addResult = (result: string) =>
                    addToolResult({ toolCallId, result });

                  // render confirmation tool (client-side tool with user interaction)
                  if (toolInvocation.toolName === "askForConfirmation") {
                    return (
                      <div key={toolCallId}>
                        {toolInvocation.args.message}
                        <div>
                          {"result" in toolInvocation ? (
                            <b>{toolInvocation.result}</b>
                          ) : (
                            <>
                              <button onClick={() => addResult("Yes")}>
                                Yes
                              </button>
                              <button onClick={() => addResult("No")}>
                                No
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // other tools:
                  return "result" in toolInvocation ? (
                    <div key={toolCallId}>
                      Tool call {`${toolInvocation.toolName}: `}
                      {toolInvocation.result}
                    </div>
                  ) : (
                    <div key={toolCallId}>
                      Calling {toolInvocation.toolName}...
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 p-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
