"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestedQuestions = [
    "What types of workbenches do you offer?",
    "I need an ESD-safe workbench for electronics",
    "What accessories are available?",
    "Help me choose a bench for my warehouse",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2"
                style={{ color: "var(--color-bench-100)", fontFamily: "var(--font-display)" }}>
                Welcome to BenchBot
              </h2>
              <p style={{ color: "var(--color-bench-400)" }} className="text-sm max-w-md">
                Your AI product assistant for BenchDepot workbenches. Ask me anything about products, specs, compatibility, or help finding the right workbench.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestedQuestions.map((q, i) => (
                <button key={i}
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 0); }}
                  className="text-left text-sm px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ background: "var(--color-bench-800)", color: "var(--color-bench-300)", border: "1px solid var(--color-bench-700)" }}
                  onMouseEnter={(e) => { e.target.style.background = "var(--color-bench-700)"; e.target.style.borderColor = "var(--color-accent-500)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "var(--color-bench-800)"; e.target.style.borderColor = "var(--color-bench-700)"; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))", color: "white", borderBottomRightRadius: "6px" }
                  : { background: "var(--color-bench-800)", color: "var(--color-bench-100)", border: "1px solid var(--color-bench-700)", borderBottomLeftRadius: "6px" }
                }>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start chat-msg">
            <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
              style={{ background: "var(--color-bench-800)", border: "1px solid var(--color-bench-700)", borderBottomLeftRadius: "6px" }}>
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--color-accent-400)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--color-accent-400)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--color-accent-400)" }} />
            </div>
          </div>
        )}
        {error && (
          <div className="chat-msg flex justify-center">
            <div className="text-sm px-4 py-2 rounded-xl" style={{ background: "#3a1c1c", color: "#f09595" }}>{error}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{ background: "var(--color-bench-800)", border: "1px solid var(--color-bench-700)" }}>
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about workbenches, specs, accessories..." rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:opacity-40"
            style={{ color: "var(--color-bench-100)", fontFamily: "var(--font-body)", maxHeight: "120px" }}
            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !loading ? "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))" : "var(--color-bench-700)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center mt-2 text-xs" style={{ color: "var(--color-bench-600)" }}>
          BenchBot may not have all product data yet. For precise quotes, visit benchdepot.com
        </p>
      </div>
    </div>
  );
}
