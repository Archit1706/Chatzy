// components/MessageInput.tsx
import React, { RefObject, useState } from "react";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    lastTypingTimeRef: RefObject<number>;
    user: string;
    webSocket: WebSocket | null;
    ttl: number;
    setTtl: React.Dispatch<React.SetStateAction<number>>;
}

const EMOJIS = ["😀", "😂", "😍", "😎", "🤔", "😴", "😭", "👍", "👏", "🙏", "❤️", "🔥", "🎉", "✨", "💯", "🚀"];
const TTL_OPTIONS = [
    { label: "Off", value: 0 },
    { label: "10s", value: 10 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "5m", value: 300 },
];

const MessageInput: React.FC<MessageInputProps> = ({
    newMessage,
    setNewMessage,
    sendMessage,
    lastTypingTimeRef,
    user,
    webSocket,
    ttl,
    setTtl,
}) => {
    const [showEmoji, setShowEmoji] = useState(false);

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center mb-2 text-xs text-gray-600 dark:text-gray-300 space-x-2">
                <span title="Self-destruct timer">⏳ Self-destruct:</span>
                {TTL_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setTtl(opt.value)}
                        className={`px-2 py-0.5 rounded-full border ${
                            ttl === opt.value
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center relative">
                <button
                    type="button"
                    onClick={() => setShowEmoji((s) => !s)}
                    className="mr-2 px-3 py-2 text-xl bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label="Toggle emoji picker"
                >
                    😊
                </button>
                {showEmoji && (
                    <div className="absolute bottom-12 left-0 z-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 shadow grid grid-cols-8 gap-1 max-w-xs">
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
        </div>
    );
};

export default MessageInput;
