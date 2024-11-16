// components/MessageInput.tsx
import React, { RefObject } from "react";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    lastTypingTimeRef: RefObject<number>;
    user: string;
    webSocket: WebSocket | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
    newMessage,
    setNewMessage,
    sendMessage,
    lastTypingTimeRef,
    user,
    webSocket,
}) => {
    return (
        <div className="p-4 flex items-center bg-gray-50 dark:bg-gray-800">
            <input
                type="text"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black dark:text-white dark:bg-gray-700"
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
                placeholder="Type your message..."
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />
            <button
                onClick={sendMessage}
                className="ml-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
                Send
            </button>
        </div>
    );
};

export default MessageInput;
