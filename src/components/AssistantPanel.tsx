import React, { useState } from "react";
import { Sparkles, Send, Loader2, Bot, User, Database, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { AssistantMessage } from "../types";

export const AssistantPanel: React.FC = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the CarboTrace AI Protocol Specialist. I have real-time verified access to the current ledger, active batches, and carbon credit tokens. How may I assist your audit or operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "Is batch #4521 verified yet?",
    "How much organic waste have we diverted?",
    "What carbon credits are currently available?",
    "What is the permanence standard for biochar under ISO 14064?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await api.askAssistant(text);
      const assistantMsg: AssistantMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundedBatches: res.groundedBatches,
        groundedCredits: res.groundedCredits,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AssistantMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `Error consulting protocol engine: ${err.message || "Unknown error"}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#12151A] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-4 border-b border-white/8 bg-[#161A20] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#8FF075]/15 border border-[#8FF075]/30 flex items-center justify-center text-[#8FF075]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <span>Ask CarboTrace</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8FF075]/10 text-[#8FF075] border border-[#8FF075]/20">
                GEMINI GROUNDED RAG
              </span>
            </h3>
            <p className="text-xs text-white/50">
              Direct natural-language querying over your verified custody records and credits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-[#8FF075]">
          <Database className="w-3.5 h-3.5" />
          <span>Ledger Connected</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-[#8FF075]/15 border border-[#8FF075]/30 flex items-center justify-center text-[#8FF075] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#3B82F6] text-white rounded-br-none"
                  : "bg-[#161A20] border border-white/10 text-white/90 rounded-bl-none font-sans"
              }`}
            >
              <p>{m.content}</p>

              {/* Grounded references tag */}
              {m.groundedBatches && m.groundedBatches.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#8FF075]">
                  <span>Grounded sources:</span>
                  {m.groundedBatches.map((b) => (
                    <span key={b} className="px-1.5 py-0.5 rounded bg-[#8FF075]/15 border border-[#8FF075]/25">
                      #{b}
                    </span>
                  ))}
                </div>
              )}

              <span className="block mt-1 text-[10px] opacity-40 font-mono text-right">
                {m.timestamp}
              </span>
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-white/50 text-xs font-mono">
            <div className="w-7 h-7 rounded-lg bg-[#8FF075]/15 flex items-center justify-center text-[#8FF075]">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>Evaluating ledger records via Gemini...</span>
          </div>
        )}
      </div>

      {/* Suggested chips */}
      <div className="px-4 py-2 bg-[#0B0D10]/50 border-t border-white/5 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-mono text-white/40 self-center mr-1">Suggestions:</span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-md bg-[#161A20] hover:bg-[#8FF075]/10 hover:text-[#8FF075] border border-white/8 text-[11px] text-white/70 transition-colors font-sans"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-white/8 bg-[#12151A] flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything regarding batch history, audit status, or carbon credits..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#8FF075] font-sans"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
