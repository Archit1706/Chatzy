// components/MessageItem.tsx
import React, { useEffect, useState } from "react";
import { Message } from "../types";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  userAvatars: { [key: string]: string };
  setModalUser: React.Dispatch<React.SetStateAction<string | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  highlight?: string;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-200/70 dark:bg-amber-400/30 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  userAvatars,
  setModalUser,
  setShowModal,
  onReact,
  onReply,
  highlight,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(
    message.expiresAt ? Math.max(0, Math.ceil((message.expiresAt - Date.now()) / 1000)) : null
  );

  useEffect(() => {
    if (!message.expiresAt) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((message.expiresAt! - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [message.expiresAt]);

  const reactionGroups: { [emoji: string]: string[] } = {};
  (message.reactions || []).forEach((r) => {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
    reactionGroups[r.emoji].push(r.user);
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const bubbleClasses = isOwnMessage
    ? "px-3.5 py-2 rounded-2xl rounded-br-md break-words bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
    : "px-3.5 py-2 rounded-2xl rounded-bl-md break-words bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 shadow-sm";

  const renderBubble = () => (
    <div className={`text-sm ${isOwnMessage ? "text-right" : "text-left"} group relative chatzy-pop`}>
      {!isOwnMessage && (
        <div className="text-[11px] font-medium mb-1 text-slate-500 dark:text-slate-400">
          {message.user}
        </div>
      )}
      <div className="relative inline-block max-w-full">
        {message.replyTo && (
          <div
            className={`mb-1 text-[11px] rounded-lg px-2 py-1 border-l-2 ${
              isOwnMessage
                ? "bg-white/15 border-white/70 text-white/90"
                : "bg-slate-100 dark:bg-slate-800/70 border-indigo-400 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="font-semibold opacity-80">↪ {message.replyTo.user}</div>
            <div className="truncate max-w-[260px]">{message.replyTo.text}</div>
          </div>
        )}
        <div className={bubbleClasses}>{highlightText(message.text, highlight || "")}</div>

        <div
          className={`absolute -top-3 ${
            isOwnMessage ? "left-0 -translate-x-2" : "right-0 translate-x-2"
          } hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-1 py-0.5 shadow z-10`}
        >
          <button
            onClick={() => setShowPicker((s) => !s)}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="React"
            title="React"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 10h.01M15 10h.01M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => onReply(message)}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Reply"
            title="Reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 17 4 12l5-5M4 12h11a5 5 0 0 1 5 5v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={copy}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Copy"
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            )}
          </button>
        </div>

        {showPicker && (
          <div
            className={`absolute z-20 mt-1 ${
              isOwnMessage ? "right-0" : "left-0"
            } flex space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow`}
          >
            {QUICK_REACTIONS.map((e) => (
              <button
                key={e}
                className="text-lg hover:scale-125 transition-transform"
                onClick={() => {
                  onReact(message.id, e);
                  setShowPicker(false);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {Object.keys(reactionGroups).length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          {Object.entries(reactionGroups).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              title={users.join(", ")}
              className="text-xs bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700"
            >
              {emoji} {users.length}
            </button>
          ))}
        </div>
      )}

      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2 justify-end">
        {!isOwnMessage && <span className="ml-0">{message.timestamp}</span>}
        {isOwnMessage && <span>{message.timestamp}</span>}
        {remaining !== null && (
          <span className="text-rose-500" title="Self-destructing">
            ⏳ {remaining}s
          </span>
        )}
        {isOwnMessage && (
          <span className={message.read ? "text-indigo-500" : ""}>
            {message.read ? "✓✓ Read" : "✓ Delivered"}
          </span>
        )}
      </div>
    </div>
  );

  const avatar = (
    <img
      src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[message.user]}`}
      alt={message.user}
      className="w-9 h-9 rounded-full cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700"
      onClick={() => {
        setModalUser(message.user);
        setShowModal(true);
      }}
    />
  );

  return (
    <div className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {!isOwnMessage && avatar}
      <div className="max-w-[78%] sm:max-w-[68%]">{renderBubble()}</div>
      {isOwnMessage && avatar}
    </div>
  );
};

export default MessageItem;
