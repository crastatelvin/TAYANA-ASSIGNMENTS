import React, { useState, useRef } from "react";
import "./Chat.css";

export default function Chat() {
  const [answer, setAnswer] = useState("");
  const [query, setQuery] = useState("What is a vector database?");
  const [token, setToken] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState("Ready");
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const askQuestion = async () => {
    if (!query) return;
    if (!token) {
      alert("Please paste a valid JWT token first!");
      return;
    }

    setAnswer("");
    setIsStreaming(true);
    setStatus("Streaming...");

    // 1. Production Improvement: Abort Controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `/api/chat/stream?q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "");
            if (text === "[DONE]") {
              finalize();
              return;
            }
            // Real-time update
            setAnswer((prev) => prev + text);
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setStatus("Cancelled");
      } else {
        setAnswer("Error: " + error.message);
        setStatus("Failed");
      }
    } finally {
      finalize();
    }
  };

  const finalize = () => {
    setIsStreaming(false);
    if (status === "Streaming...") setStatus("Completed");
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="chat-container">
      <h1>Premium RAG Chat</h1>
      <p className="subtitle">Streaming AI UX Solution</p>

      <div className="input-section">
        <input
          type="text"
          placeholder="Paste JWT Token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="token-input"
        />
        <div className="query-group">
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && askQuestion()}
          />
          {!isStreaming ? (
            <button onClick={askQuestion} className="primary-btn">
              Ask AI
            </button>
          ) : (
            <button onClick={stopStreaming} className="danger-btn">
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="response-box">
        <div className={`answer-text ${isStreaming ? "cursor" : ""}`}>
          {answer || "Waiting for input..."}
        </div>
      </div>

      <div className="footer">
        <span>Status: {status}</span>
      </div>
    </div>
  );
}
