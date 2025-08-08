"use client";

import { useChat } from "ai/react";
import { useState } from "react";

interface VideoChatProps {
  videoId: string;
}

export default function VideoChat({ videoId }: VideoChatProps) {
  const [apiCalled, setApiCalled] = useState(false);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: { videoId },
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content: "I'm ready to help analyze your TikTok content.",
      },
    ],
    onResponse: () => {
      setApiCalled(true);
    },
  });

  return (
    <div className="flex flex-col h-[500px] max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">AI Content Assistant</h2>

      <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-4 bg-gray-50">
        {messages
          .filter(message => message.role !== "system")
          .map(message => (
            <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-blue-700 font-medium" : "text-gray-800"}`}>
              <div className="text-sm text-gray-500 mb-1">{message.role === "user" ? "You" : "AI Assistant"}</div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}

        {messages.length === 1 && !apiCalled && (
          <div className="text-gray-500 italic">Ask me about your TikTok video content. I can help analyze engagement, suggest improvements, or answer questions about content strategy.</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your TikTok content..."
          className="flex-1 border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Send
        </button>
      </form>
    </div>
  );
}
