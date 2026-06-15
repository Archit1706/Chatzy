// components/MessageInput.tsx
import React, { RefObject, useEffect, useRef, useState } from "react";
import { ReplyRef } from "../types";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    lastTypingTimeRef: RefObject<number>;
    user: string;
    webSocket: WebSocket | null;
    ttl: number;
    setTtl: React.Dispatch<React.SetStateAction<number>>;
    replyTo: ReplyRef | null;
    clearReply: () => void;
}

const EMOJIS = ["😀", "😂", "😍", "😎", "🤔", "😴", "😭", "👍", "👏", "🙏", "❤️", "🔥", "🎉", "✨", "💯", "🚀"];
const TTL_OPTIONS = [
    { label: "Off", value: 0 },
    { label: "10s", value: 10 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "5m", value: 300 },
];
const MAX_LEN = 2000;

const MessageInput: React.FC<MessageInputProps> = ({
    newMessage,
    setNewMessage,
    sendMessage,
    lastTypingTimeRef,
    user,
    webSocket,
    ttl,
    setTtl,
    replyTo,
    clearReply,
}) => {
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }, [newMessage]);

    // Focus when replying
    useEffect(() => {
        if (replyTo) textareaRef.current?.focus();
    }, [replyTo]);

    return (
        <div className="px-3 pb-3 pt-2 bg-transparent">
            {replyTo && (
                <div className="mb-2 flex items-center gap-2 bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 rounded-xl px-3 py-2">
                    <div className="w-0.5 self-stretch bg-indigo-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
                            Replying to {replyTo.user}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {replyTo.text}
                        </div>
                    </div>
                    <button
                        onClick={clearReply}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Cancel reply"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">
                <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                    Self-destruct
                </span>
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                    {TTL_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTtl(opt.value)}
                            className={`px-2.5 py-0.5 rounded-full transition ${
                                ttl === opt.value
                                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <span className="ml-auto tabular-nums">
                    {newMessage.length}/{MAX_LEN}
                </span>
            </div>

            <div className="relative flex items-end gap-2 bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/30 transition">
                <button
                    type="button"
                    onClick={() => setShowEmoji((s) => !s)}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Toggle emoji picker"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9 10h.01M15 10h.01M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
                    </svg>
                </button>
                {showEmoji && (
                    <div className="absolute bottom-14 left-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-lg grid grid-cols-8 gap-1 max-w-xs">
                        {EMOJIS.map((e) => (
                            <button
                                key={e}
                                className="text-xl hover:scale-125 transition-transform"
                                onClick={() => {
                                    setNewMessage((prev) => prev + e);
                                    setShowEmoji(false);
                                }}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    maxLength={MAX_LEN}
                    className="flex-1 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 py-1.5 px-1 text-sm max-h-40"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        const now = Date.now();
                        if (
                            now - lastTypingTimeRef.current > 1000 &&
                            webSocket &&
                            webSocket.readyState === WebSocket.OPEN
                        ) {
                            webSocket.send(JSON.stringify({ event: "typing", user }));
                            lastTypingTimeRef.current = now;
                        }
                    }}
                    placeholder="Message…  (Shift+Enter for new line)"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={newMessage.trim() === ""}
                    className="p-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Send"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
