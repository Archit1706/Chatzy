// components/ChatMessages.tsx
import React from "react";
import { Message } from "../types";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

interface ChatMessagesProps {
    messages: Message[];
    user: string;
    typingUsers: { [key: string]: number };
    chatContainerRef: React.RefObject<HTMLDivElement>;
    userAvatars: { [key: string]: string };
    setModalUser: React.Dispatch<React.SetStateAction<string | null>>;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    onReact: (messageId: string, emoji: string) => void;
    onReply: (message: Message) => void;
    searchQuery: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    user,
    typingUsers,
    chatContainerRef,
    userAvatars,
    setModalUser,
    setShowModal,
    onReact,
    onReply,
    searchQuery,
}) => {
    const trimmed = searchQuery.trim().toLowerCase();
    const filtered = trimmed
        ? messages.filter((m) => m.text.toLowerCase().includes(trimmed))
        : messages;

    return (
        <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-h-[calc(100vh-220px)]"
        >
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-sm">
                        {trimmed ? "No matches." : "No messages yet."}
                    </p>
                    <p className="text-xs mt-1 opacity-75">
                        🔒 Nothing is saved on the server.
                    </p>
                </div>
            )}
            {filtered.map((message) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user === user}
                    userAvatars={userAvatars}
                    setModalUser={setModalUser}
                    setShowModal={setShowModal}
                    onReact={onReact}
                    onReply={onReply}
                    highlight={trimmed}
                />
            ))}
            {Object.keys(typingUsers).length > 0 && (
                <TypingIndicator typingUsers={typingUsers} />
            )}
        </div>
    );
};

export default ChatMessages;
