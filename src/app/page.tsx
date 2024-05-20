"use client";

import DashboardPage from "@/app/dashboard/page";

import { useEffect, useState } from "react";

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return messages;
};

export default function Home() {
  const messages = useWebSocket("ws://localhost:8080");

  return (
    <div>
      <h1>WebSocket Messages</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
      <div>
        <DashboardPage />
      </div>
    </div>
  );
}
