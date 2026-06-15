// components/ChatHeader.tsx
import React from "react";
import { ConnectionStatus } from "../types";

interface ChatHeaderProps {
    otherUser: string;
    onlineUsers: { [key: string]: boolean };
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    soundOn: boolean;
    setSoundOn: React.Dispatch<React.SetStateAction<boolean>>;
    onClearChat: () => void;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    connectionStatus: ConnectionStatus;
    userAvatar: string;
    onAvatarClick: () => void;
}

const statusDot: Record<ConnectionStatus, string> = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-500 animate-pulse",
    disconnected: "bg-rose-500",
};

const statusLabel: Record<ConnectionStatus, string> = {
    connected: "Connected",
    connecting: "Connecting…",
    disconnected: "Offline",
};

const IconButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = "", ...rest }) => (
    <button
        {...rest}
        className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition ${className}`}
    >
        {children}
    </button>
);

const ChatHeader: React.FC<ChatHeaderProps> = ({
    otherUser,
    onlineUsers,
    darkMode,
    setDarkMode,
    soundOn,
    setSoundOn,
    onClearChat,
    searchQuery,
    setSearchQuery,
    connectionStatus,
    userAvatar,
    onAvatarClick,
}) => {
    const online = !!onlineUsers[otherUser];
    return (
        <div className="w-full max-w-3xl mt-6 sm:mt-8 px-4">
            <div className="flex items-center gap-3 backdrop-blur bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl px-3 py-2 shadow-sm">
                <button
                    onClick={onAvatarClick}
                    className="relative shrink-0 focus:outline-none"
                    aria-label="Edit your profile"
                >
                    <img
                        src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatar}`}
                        alt="You"
                        className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900"
                    />
                </button>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {otherUser}
                        </h1>
                        <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                online
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    online ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                            />
                            {online ? "online" : "offline"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[connectionStatus]}`} />
                        {statusLabel[connectionStatus]} · ephemeral session
                    </div>
                </div>

                <div className="hidden sm:block relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-40 md:w-56 pl-8 pr-3 py-1.5 text-sm rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none transition"
                    />
                    <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="flex items-center gap-1">
                    <IconButton
                        onClick={() => setSoundOn((s) => !s)}
                        title={soundOn ? "Mute notifications" : "Unmute notifications"}
                        aria-label="Toggle sound"
                    >
                        {soundOn ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Z" />
                                <path strokeLinecap="round" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Z" />
                                <path strokeLinecap="round" d="m16 9 5 6m0-6-5 6" />
                            </svg>
                        )}
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            if (window.confirm("Wipe this chat for everyone? It can't be undone.")) {
                                onClearChat();
                            }
                        }}
                        title="Wipe chat for everyone"
                        aria-label="Clear chat"
                        className="hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12Z" />
                        </svg>
                    </IconButton>
                    <IconButton
                        onClick={() => setDarkMode(!darkMode)}
                        aria-label="Toggle dark mode"
                        title="Toggle theme"
                    >
                        {darkMode ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 1.5a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4 12a1 1 0 0 1 1-1h1.5a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm13.5-1a1 1 0 1 0 0 2H19a1 1 0 1 0 0-2h-1.5ZM6.34 6.34a1 1 0 0 1 1.42 0l1.06 1.07a1 1 0 0 1-1.42 1.41L6.34 7.76a1 1 0 0 1 0-1.42Zm9.84 9.84a1 1 0 0 1 1.41 0l1.07 1.06a1 1 0 1 1-1.42 1.42l-1.06-1.07a1 1 0 0 1 0-1.41Zm1.41-9.84a1 1 0 0 1 0 1.42L16.52 8.82a1 1 0 1 1-1.42-1.41l1.07-1.07a1 1 0 0 1 1.42 0ZM7.76 16.18a1 1 0 0 1 0 1.41L6.7 18.66a1 1 0 1 1-1.42-1.42l1.07-1.06a1 1 0 0 1 1.41 0Z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.293 14.707a8 8 0 0 1-11.586-11.586 9 9 0 1 0 11.586 11.586Z" />
                            </svg>
                        )}
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
