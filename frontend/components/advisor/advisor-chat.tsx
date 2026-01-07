"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Trash2, Cpu, Zap, HelpCircle, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Cpu, label: "Gaming Build <$1000", prompt: "I need a gaming PC build under $1000 for 1440p gaming." },
  { icon: Zap, label: "RTX 4070 vs RX 7800 XT", prompt: "Which is better value: RTX 4070 Super or RX 7800 XT?" },
  { icon: Terminal, label: "Debug My Build", prompt: "I have a Ryzen 5 7600X and want to pair it with an RTX 4090. Is that a bottleneck?" },
  { icon: HelpCircle, label: "Streaming Setup", prompt: "What CPU do I need for streaming to Twitch while gaming?" },
];

export function AdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Greetings! I am **SiliconSage**. I'm here to optimize your build for maximum performance per dollar.\n\nAsk me about:\n- Part Recommendations\n- Bottleneck Analysis\n- Value Comparisons",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, manualPrompt?: string) => {
    if (e) e.preventDefault();
    const text = manualPrompt || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I seem to be having trouble connecting to my neural core (API Error). Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex overflow-hidden">

      {/* Sidebar - Context & Quick Prompts */}
      <div className="w-80 bg-[#1c1917] border-r border-[#292524] hidden lg:flex flex-col">
        <div className="p-6 border-b border-[#292524]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#ff4b4b] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">SiliconSage</h2>
              <span className="text-xs text-[#ffa828] bg-[#ffa828]/10 px-2 py-0.5 rounded-full border border-[#ffa828]/20">Online</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            "I don't just build PCs. I build value engines."
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 px-2">Quick Actions</h3>
            <div className="space-y-2">
              {quickPrompts.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(undefined, item.prompt)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm text-stone-300 hover:bg-[#292524] hover:text-white transition-colors group"
                >
                  <item.icon className="w-4 h-4 text-stone-500 group-hover:text-[#ff4b4b]" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#292524]">
          <button
            onClick={() => setMessages([messages[0]])}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Conversation
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#171514] relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#ff4b4b] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 shadow-sm ${message.role === "user"
                    ? "bg-[#ffa828] text-[#171514] font-medium"
                    : "bg-[#292524] text-stone-200 border border-[#44403c]"
                  }`}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={j} className={message.role === "assistant" ? "text-white" : "text-[#171514]"}>{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    ))}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#292524] flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-stone-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#ff4b4b] flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-[#292524] rounded-2xl p-4 border border-[#44403c] flex items-center gap-2">
                <span className="text-sm text-stone-400 animate-pulse">Computing optimal recommendation...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#292524] bg-[#171514]">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask SiliconSage about your build..."
              rows={1}
              className="w-full pl-6 pr-14 py-4 bg-[#1c1917] border border-[#292524] focus:border-[#ffa828] rounded-full text-stone-200 placeholder-stone-500 resize-none focus:outline-none focus:ring-1 focus:ring-[#ffa828] transition-all shadow-lg"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#ff4b4b] text-white rounded-full hover:bg-[#ffa828] disabled:opacity-50 disabled:bg-[#292524] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-stone-600 mt-2">
            SiliconSage allows you to make informed decisions. AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
