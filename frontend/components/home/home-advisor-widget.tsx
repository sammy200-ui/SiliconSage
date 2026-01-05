"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function HomeAdvisorWidget() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMsg = query.trim();
        // Add user message immediately
        const newUserMsg: Message = { role: "user", content: userMsg };
        setMessages((prev) => [...prev, newUserMsg]);
        setQuery("");
        setIsLoading(true);
        setShowResult(true);

        try {
            // Call AI endpoint
            const response = await fetch("/api/advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newUserMsg],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();

            setMessages((prev) => [...prev, {
                role: "assistant",
                content: data.content || "I apologize, but I couldn't generate a response. Please try again."
            }]);
        } catch {
            // Fallback local response if API fails (same as AdvisorChat)
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "I'm having trouble connecting to the cloud, but generally I recommend checking our Builder page for compatibility!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-[#1c1917] border border-[#292524] rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-[#292524] flex items-center gap-3 border-b border-[#44403c]">
                <div className="w-8 h-8 bg-[#ff4b4b] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-200">AI Build Advisor</h3>
                    <p className="text-xs text-stone-400">Ask about compatibility, value, or parts</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="h-[300px] flex flex-col p-4">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-75">
                        <Bot className="w-12 h-12 text-[#ffa828] mb-3" />
                        <p className="text-stone-400 text-sm">
                            "Is a Ryzen 5 7600X enough for an RTX 4070?"
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-[#ffa828]" : "bg-[#292524]"
                                    }`}>
                                    {msg.role === "user" ? <User className="w-4 h-4 text-[#171514]" /> : <Bot className="w-4 h-4 text-[#c678dd]" />}
                                </div>
                                <div className={`p-3 rounded-xl text-sm ${msg.role === "user"
                                    ? "bg-[#ffa828] text-[#171514] font-medium"
                                    : "bg-[#292524] text-stone-200"
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#292524] flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-[#c678dd]" />
                                </div>
                                <div className="bg-[#292524] p-3 rounded-xl">
                                    <Loader2 className="w-4 h-4 text-[#ffa828] animate-spin" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[#292524] bg-[#171514]">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask AI..."
                        className="w-full pl-4 pr-10 py-3 bg-[#1c1917] border border-[#292524] rounded-xl text-sm focus:outline-none focus:border-[#ffa828] transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#ff4b4b] hover:bg-[#ffa828] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
