"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BuildState } from "./builder-interface";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface BuilderAdvisorProps {
    build: BuildState;
}

export function BuilderAdvisor({ build }: BuilderAdvisorProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        // Construct a context-aware prompt based on current build
        const buildContext = `
      Current Build State:
      CPU: ${build.cpu?.name || "None"}
      GPU: ${build.gpu?.name || "None"}
      RAM: ${build.ram?.name || "None"}
      Mobo: ${build.motherboard?.name || "None"}
      PSU: ${build.psu?.name || "None"}
    `;

        try {
            const response = await fetch("/api/advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // We prepend context to the last message for the AI
                body: JSON.stringify({
                    messages: [
                        ...messages,
                        { role: "user", content: `[Context: ${buildContext}] ${userMsg}` }
                    ]
                }),
            });

            if (!response.ok) throw new Error("Failed");
            const data = await response.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having trouble analyzing this specific build right now, but generally, make sure your CPU and GPU are balanced!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#1c1917] border border-[#292524] rounded-xl flex flex-col h-[600px] overflow-hidden sticky top-8">
            <div className="p-4 bg-[#292524] border-b border-[#44403c] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#ff4b4b] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-200">AI Technician</h3>
                    <p className="text-xs text-stone-400">Analyzing your build in real-time</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                        <Bot className="w-12 h-12 text-[#ffa828] mx-auto mb-3" />
                        <p className="text-sm text-stone-400">
                            "Does this PSU have enough wattage for my build?"
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-[#ffa828]" : "bg-[#292524]"
                            }`}>
                            {msg.role === "user" ? <User className="w-4 h-4 text-[#171514]" /> : <Bot className="w-4 h-4 text-[#c678dd]" />}
                        </div>
                        <div className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.role === "user"
                                ? "bg-[#ffa828] text-[#171514] font-medium"
                                : "bg-[#292524] text-stone-300"
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#292524] flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[#c678dd]" />
                        </div>
                        <div className="bg-[#292524] p-3 rounded-xl">
                            <Loader2 className="w-4 h-4 text-[#ffa828] animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-[#292524] bg-[#171514]">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this build..."
                        className="w-full pl-4 pr-10 py-3 bg-[#1c1917] border border-[#292524] rounded-xl text-sm focus:outline-none focus:border-[#ffa828] transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#ff4b4b] hover:bg-[#ffa828] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
