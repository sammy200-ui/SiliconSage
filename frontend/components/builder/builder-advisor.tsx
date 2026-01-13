"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-60">
                        <Bot className="w-10 h-10 text-[#ffa828] mx-auto mb-3" />
                        <p className="text-sm text-stone-400 mb-4">Ask me about your build!</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => setInput("Is my build balanced?")}
                                className="text-xs px-3 py-1.5 bg-[#292524] hover:bg-[#44403c] text-stone-300 rounded-full transition-colors"
                            >
                                Is my build balanced?
                            </button>
                            <button
                                onClick={() => setInput("Is my PSU wattage enough?")}
                                className="text-xs px-3 py-1.5 bg-[#292524] hover:bg-[#44403c] text-stone-300 rounded-full transition-colors block mx-auto"
                            >
                                Is my PSU wattage enough?
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-[#ffa828]" : "bg-[#292524]"}`}>
                            {msg.role === "user" ? <User className="w-3.5 h-3.5 text-[#171514]" /> : <Bot className="w-3.5 h-3.5 text-[#c678dd]" />}
                        </div>
                        <div className={`p-2.5 rounded-xl text-xs max-w-[80%] ${msg.role === "user" ? "bg-[#ffa828] text-[#171514] font-medium" : "bg-[#292524] text-stone-300"}`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#292524] flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-[#c678dd]" />
                        </div>
                        <div className="bg-[#292524] p-2.5 rounded-xl">
                            <Loader2 className="w-4 h-4 text-[#ffa828] animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[#292524] bg-[#171514]">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your build..."
                        className="w-full pl-3 pr-10 py-2.5 bg-[#1c1917] border border-[#292524] rounded-lg text-sm focus:outline-none focus:border-[#ffa828] transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#ff4b4b] hover:bg-[#ffa828] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
