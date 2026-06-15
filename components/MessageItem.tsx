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
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  userAvatars,
  setModalUser,
  setShowModal,
  onReact,
}) => {
  const [showPicker, setShowPicker] = useState(false);
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

  // Aggregate reactions by emoji
  const reactionGroups: { [emoji: string]: string[] } = {};
  (message.reactions || []).forEach((r) => {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
    reactionGroups[r.emoji].push(r.user);
  });

  const bubbleClasses = isOwnMessage
    ? "p-2 rounded-lg break-words bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
    : "p-2 rounded-lg break-words bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

  const renderBubble = () => (
    <div className={`text-sm ${isOwnMessage ? "text-right" : "text-left"} group relative`}>
      <div className="text-sm font-semibold mb-1 text-black dark:text-gray-100">
        {message.user}
      </div>
      <div className="relative inline-block">
        <div className={bubbleClasses}>{message.text}</div>
        <button
          onClick={() => setShowPicker((s) => !s)}
          className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xs shadow"
          aria-label="React"
          title="React"
        >
          ☺
        </button>
        {showPicker && (
          <div
            className={`absolute z-20 mt-1 ${
              isOwnMessage ? "right-0" : "left-0"
            } flex space-x-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full px-2 py-1 shadow`}
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
              className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {emoji} {users.length}
            </button>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {message.timestamp}
        {remaining !== null && (
          <span className="ml-2 text-red-500" title="Self-destructing">
            ⏳ {remaining}s
          </span>
        )}
      </div>
      {isOwnMessage && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {message.read ? "Read" : "Delivered"}
        </div>
      )}
    </div>
  );

  const avatar = (
    <img
      src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[message.user]}`}
      alt="Avatar"
      className="w-10 h-10 rounded-full cursor-pointer"
      onClick={() => {
        setModalUser(message.user);
        setShowModal(true);
      }}
    />
  );

  return (
    <div className={`flex items-start ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="flex items-center space-x-3 max-w-[60%]">
        {isOwnMessage ? (
          <>
            {renderBubble()}
            {avatar}
          </>
        ) : (
          <>
            {avatar}
            {renderBubble()}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
