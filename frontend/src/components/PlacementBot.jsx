import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import ReactMarkdown from 'react-markdown';

/**
 * PlacementBot floating widget shell — Sprint 4
 * Static UI only; AI wiring added in Sprint 5 via POST /api/ai/chat
 */
export default function PlacementBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", content: "Hi! 👋 I'm PlacementBot, your campus placement assistant. Ask me about drives, cutoffs, schedules, or anything placement-related!" },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;

        // Current message format to append
        const newMsg = { role: "user", content: text };

        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setTyping(true);

        try {
            // Strip the placeholder message if it's the very first one to avoid confusing the AI
            let historyPayload = messages.filter(m => m.role !== "bot" || !m.content.includes("Hi! 👋 I'm PlacementBot"));

            // Limit history to last 10 messages for context
            historyPayload = historyPayload.slice(-10);

            const res = await api.post("/api/ai/chat", {
                message: text,
                history: historyPayload,
                session_id: "placementbot_session"
            });

            setMessages((prev) => [
                ...prev,
                { role: "bot", content: res.data.reply },
            ]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "PlacementBot is temporarily unavailable. Please try again later. 🚀" },
            ]);
        } finally {
            setTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((p) => !p)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FFCC00] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center text-2xl font-black"
                aria-label="Open PlacementBot"
            >
                {open ? "✕" : "🤖"}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="bg-black text-white px-4 py-3 flex items-center gap-3 border-b-[3px] border-black">
                        <span className="text-2xl border-2 border-white bg-[#FFCC00] p-1 shadow-[2px_2px_0px_0px_#FFF]">🤖</span>
                        <div>
                            <h3 className="text-md font-black tracking-wider uppercase">PlacementBot</h3>
                            <p className="text-[10px] text-[#FFCC00] font-bold tracking-widest uppercase">AI Placement Assistant</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[280px] max-h-[340px] bg-[#FAFAFA] scrollbar-brutal">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "bot" && (
                                    <span className="w-8 h-8 bg-[#FFCC00] text-black border-2 border-black flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0 shadow-[2px_2px_0px_0px_#000]">
                                        🤖
                                    </span>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-3 text-sm font-bold leading-relaxed border-[2px] border-black shadow-[4px_4px_0px_0px_#000] ${msg.role === "user"
                                        ? "bg-black text-white"
                                        : "bg-white text-black prose prose-sm prose-p:my-1 prose-ul:my-1 prose-a:text-[#E53955] prose-a:font-black prose-a:underline max-w-full overflow-hidden"
                                        }`}
                                >
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {/* Typing indicator */}
                        {typing && (
                            <div className="flex justify-start">
                                <span className="w-8 h-8 bg-[#FFCC00] text-black border-2 border-black flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0 shadow-[2px_2px_0px_0px_#000]">
                                    🤖
                                </span>
                                <div className="bg-white border-2 border-black px-4 py-3 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
                                    <span className="w-3 h-3 bg-black border border-black animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-3 h-3 bg-gray-500 border border-black animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-3 h-3 bg-gray-300 border border-black animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input bar */}
                    <div className="border-t-[3px] border-black px-3 py-3 flex items-center gap-2 bg-[#FFCC00]">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="ASK ABOUT PLACEMENTS..."
                            className="flex-1 px-3 py-2 text-sm font-bold uppercase tracking-wider border-[2px] border-black focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all bg-white"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="w-10 h-10 bg-black text-white border-[2px] border-black flex items-center justify-center hover:bg-gray-800 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed font-black"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
