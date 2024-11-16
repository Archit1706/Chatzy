// components/ChatHeader.tsx
import React from "react";

interface ChatHeaderProps {
    otherUser: string;
    onlineUsers: { [key: string]: boolean };
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    otherUser,
    onlineUsers,
    darkMode,
    setDarkMode,
}) => {
    return (
        <div className="flex items-center justify-between w-full max-w-3xl mt-8 px-4">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Chat with {otherUser}{" "}
                {onlineUsers[otherUser] ? (
                    <span className="text-green-500">(Online)</span>
                ) : (
                    <span className="text-gray-500">(Offline)</span>
                )}
            </h1>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded-lg focus:outline-none"
            >
                {darkMode ? (
                    // Sun icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={0}
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.22a1 1 0 011.415 0l.707.707a1 1 0 11-1.414 1.414L16.22 5.636a1 1 0 010-1.415zM21 11a1 1 0 110 2h-1a1 1 0 110-2h1zm-9 8a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm7.071-1.071a1 1 0 010 1.415l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM4 11a1 1 0 110 2H3a1 1 0 110-2h1zm2.929-5.071a1 1 0 010 1.415L6.222 7.05a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 6a6 6 0 100 12A6 6 0 0012 6z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    // Moon icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.293 14.707a8 8 0 01-11.586-11.586A9 9 0 1017.293 14.707z"
                        />
                    </svg>
                )}

            </button>
        </div>
    );
};

export default ChatHeader;
