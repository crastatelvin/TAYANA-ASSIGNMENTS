import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";
import { API_BASE } from "../config";

interface ChatProps {
  token: string;
}

interface Message {
  role: "user" | "ai";
  text: string;
  duration?: number;
  isCached?: boolean;
}

export default function Chat({ token }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState("Ready");
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const askQuestion = async () => {
    if (!query) return;
    if (!token) {
      alert("Please paste a valid JWT token first!");
      return;
    }

    const userMessage: Message = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsStreaming(true);
    setStatus("Streaming...");

    const startTime = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add empty AI message to stream into
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    try {
      const response = await fetch(
        `${API_BASE}/chat/stream?q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token.trim()}`,
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

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "");
            if (text === "[DONE]") {
              finalize(startTime);
              return;
            }
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "ai") {
                return [...prev.slice(0, -1), { ...last, text: last.text + text }];
              }
              return prev;
            });
          }
        }
      }
    } catch (error: unknown) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, text: "Error: " + (error instanceof Error ? error.message : String(error)) }];
      });
      setStatus("Failed");
    } finally {
      finalize(startTime);
    }
  };

  const finalize = (startTime: number) => {
    setIsStreaming(false);
    const duration = Date.now() - startTime;
    setStatus("Completed");

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last.role === "ai") {
        return [...prev.slice(0, -1), { 
            ...last, 
            duration, 
            isCached: duration < 200 // Increased threshold slightly for UI consistency
        }];
      }
      return prev;
    });
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="gradient-text">Premium RAG Chat</h1>
        <p className="subtitle">Streaming AI UX Solution</p>
      </div>

      <div className="response-box history">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-content">
                <div className="role-label">{msg.role === "user" ? "You" : "AI Assistant"}</div>
                <div className="text-body">{msg.text}</div>
                {msg.role === "ai" && msg.duration !== undefined && (
                  <div className="message-meta">
                    <span className="time-tag">{msg.duration}ms</span>
                    {msg.isCached && <span className="cache-tag">⚡ Cached</span>}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="ai-icon">✨</div>
            <p>Ask anything about your ingested documents.</p>
            <span className="hint">Try: "What are the main points in the PDF?"</span>
          </div>
        )}
        <div ref={responseEndRef} />
      </div>

      <div className="input-section">
        <div className="query-group">
          <input
            type="text"
            placeholder="Type your message..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && askQuestion()}
            disabled={isStreaming}
          />
          {!isStreaming ? (
            <button onClick={askQuestion} className="primary-btn" disabled={!query}>
              Send
            </button>
          ) : (
            <button onClick={stopStreaming} className="danger-btn">
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="footer">
        <div className="footer-left">
          <span className="status-badge">Status: {status}</span>
        </div>
        <div className="footer-right">
          <span>Vector Search Enabled</span>
        </div>
      </div>
    </div>
  );
}
