"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "What's the best GPU for 1440p gaming under $500?",
  "Is a Ryzen 5 7600X good for streaming?",
  "Should I get DDR4 or DDR5 for my build?",
  "What PSU wattage do I need for an RTX 4070?",
  "Is building a PC better than buying a PS5?",
];

export function AdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm your AI PC building advisor, powered by Llama 3. I can help you with:\n\n• **Part recommendations** based on your budget and needs\n• **Compatibility questions** between components\n• **Performance expectations** for different games\n• **Value comparisons** between PC, console, and laptops\n\nWhat would you like to know?",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call AI endpoint
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

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Fallback response when API is not configured
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateLocalResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("gpu") || q.includes("graphics")) {
      if (q.includes("1440p")) {
        return "For 1440p gaming, I'd recommend:\n\n**Under $400:** AMD RX 7700 XT - Great value with 12GB VRAM\n**Under $500:** NVIDIA RTX 4070 - Excellent ray tracing & DLSS 3\n**Best Overall:** RTX 4070 Super ($599) - Best 1440p performance\n\nThe RX 7700 XT offers the best raw performance per dollar, while the RTX 4070 is better if you want ray tracing and DLSS frame generation.";
      }
      if (q.includes("4k")) {
        return "For 4K gaming, you'll need serious GPU power:\n\n**Entry 4K:** RTX 4070 Ti Super (~$799) - 60+ FPS in most games\n**Solid 4K:** RTX 4080 Super (~$999) - Smooth 4K with ray tracing\n**No Compromises:** RTX 4090 (~$1599) - 4K/120+ FPS capable\n\nNote: 4K gaming is expensive. If budget is a concern, 1440p monitors offer great visuals at much lower GPU costs!";
      }
      return "What resolution are you targeting? For 1080p, an RTX 4060 or RX 6700 XT is plenty. For 1440p, look at RTX 4070 or RX 7700 XT. For 4K, you'll want RTX 4080 or higher.";
    }

    if (q.includes("cpu") || q.includes("processor") || q.includes("ryzen") || q.includes("intel")) {
      if (q.includes("stream")) {
        return "For streaming while gaming, I recommend:\n\n**Best Value:** AMD Ryzen 7 5800X (~$200) - 8 cores handles streaming great\n**Modern Choice:** Ryzen 7 7700X (~$350) - Newer platform with DDR5\n**Gaming King:** Ryzen 7 7800X3D (~$450) - Best gaming + good streaming\n\nThe extra cores help with encoding while gaming. If you use NVENC (GPU encoding) on an NVIDIA card, even a Ryzen 5 5600X works fine!";
      }
      return "CPU choice depends on your use case:\n\n**Gaming Only:** AMD Ryzen 5 7600X or Intel i5-13400F\n**Gaming + Streaming:** AMD Ryzen 7 7700X or Intel i7-13700K\n**Gaming + Heavy Workloads:** AMD Ryzen 9 7900X or Intel i9-13900K\n\nFor pure gaming, the Ryzen 7 7800X3D is the current champion thanks to its 3D V-Cache!";
    }

    if (q.includes("ddr4") || q.includes("ddr5") || q.includes("ram") || q.includes("memory")) {
      return "**DDR4 vs DDR5 - The Real Talk:**\n\n**DDR4 (3600MHz):**\n• Cheaper (~$60-80 for 32GB)\n• Mature platform (AM4, older Intel)\n• 95% gaming performance vs DDR5\n\n**DDR5 (5600MHz+):**\n• Future-proof\n• Better for productivity\n• Required for AM5 and Intel 13th/14th Gen\n• Still ~$100-150 for 32GB\n\n**My Take:** If building new with AM5 or LGA1700, go DDR5. If upgrading existing AM4 build, DDR4 is fine. The gaming difference is minimal (2-5 FPS).";
    }

    if (q.includes("psu") || q.includes("power supply") || q.includes("wattage")) {
      return "**PSU Recommendations by GPU:**\n\n• RTX 4060 / RX 7600 → 550W minimum\n• RTX 4070 / RX 7700 XT → 650W minimum\n• RTX 4070 Super/Ti → 700W recommended\n• RTX 4080 / RX 7900 XT → 750W recommended\n• RTX 4090 → 850W+ recommended (1000W for safety)\n\n**Pro Tips:**\n1. Always get 80+ Gold or better\n2. Add 100-150W headroom for future upgrades\n3. Stick with reputable brands: Corsair, Seasonic, EVGA, be quiet!";
    }

    if (q.includes("ps5") || q.includes("xbox") || q.includes("console") || q.includes("worth")) {
      return "**PC vs Console - Honest Comparison:**\n\n**PS5/Xbox Series X ($499):**\n✅ Just works, no troubleshooting\n✅ Exclusive games (Spider-Man, God of War)\n✅ Couch gaming optimized\n❌ Locked to 60-120 FPS\n❌ Paid online ($60/year)\n\n**PC at $700-800:**\n✅ Better graphics if you spend $1000+\n✅ Free online, cheaper games\n✅ Upgradable, multi-purpose\n❌ More expensive for same performance\n❌ Requires more setup/maintenance\n\n**My Take:** Under $700 budget? Console wins on value. $1000+? PC starts making sense. $1500+? PC is clearly superior.";
    }

    return "That's a great question! To give you the best advice, could you tell me:\n\n1. **Budget** - What's your total build budget?\n2. **Use Case** - Gaming only, streaming, productivity?\n3. **Resolution** - 1080p, 1440p, or 4K?\n4. **Games** - What do you mainly play?\n\nWith these details, I can give you specific part recommendations!";
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#292524]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#ff4b4b] rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Advisor</h1>
            <p className="text-sm text-stone-400">Powered by Llama 3 via Groq</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${message.role === "user"
                ? "bg-[#ffa828]"
                : "bg-[#292524]"
                }`}>
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-[#c678dd]" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                <div className={`inline-block p-4 rounded-2xl ${message.role === "user"
                  ? "bg-[#ffa828] text-[#171514] font-medium"
                  : "bg-[#292524] text-stone-200"
                  }`}>
                  <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                    {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className={message.role === "assistant" ? "text-[#ffa828]" : ""}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                </div>
                <div className={`text-xs text-stone-500 mt-1 ${message.role === "user" ? "text-right" : ""}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292524] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#c678dd]" />
            </div>
            <div className="bg-[#292524] rounded-2xl p-4">
              <Loader2 className="w-5 h-5 text-[#ffa828] animate-spin" />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 py-3 border-t border-[#292524]">
          <p className="text-xs text-stone-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestionClick(q)}
                className="px-3 py-1.5 text-sm bg-[#1c1917] hover:bg-[#292524] border border-[#292524] rounded-full text-stone-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#292524]">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about PC parts, builds, or anything tech..."
              rows={1}
              className="w-full px-4 py-3 bg-[#1c1917] border border-[#292524] rounded-xl resize-none focus:outline-none focus:border-[#ffa828] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-[#ff4b4b] hover:bg-[#ffa828] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
