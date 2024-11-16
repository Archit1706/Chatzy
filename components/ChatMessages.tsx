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
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    user,
    typingUsers,
    chatContainerRef,
    userAvatars,
    setModalUser,
    setShowModal,
}) => {
    return (
        <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)] border-b border-gray-300 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
        >
            {messages.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-center">
                    No messages yet.
                </div>
            )}
            {messages.map((message, index) => (
                <MessageItem
                    key={index}
                    message={message}
                    isOwnMessage={message.user === user}
                    userAvatars={userAvatars}
                    setModalUser={setModalUser}
                    setShowModal={setShowModal}
                />
            ))}
            {Object.keys(typingUsers).length > 0 && (
                <TypingIndicator typingUsers={typingUsers} />
            )}
        </div>
    );
};

export default ChatMessages;
