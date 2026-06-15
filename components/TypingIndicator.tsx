// components/TypingIndicator.tsx
import React from "react";

interface TypingIndicatorProps {
    typingUsers: { [key: string]: number };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
    const names = Object.keys(typingUsers);
    if (names.length === 0) return null;

    return (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm px-2">
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 chatzy-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 chatzy-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 chatzy-dot" />
            </span>
            <span>
                {names.join(", ")} {names.length === 1 ? "is" : "are"} typing…
            </span>
        </div>
    );
};

export default TypingIndicator;
