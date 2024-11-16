// components/TypingIndicator.tsx
import React from "react";

interface TypingIndicatorProps {
    typingUsers: { [key: string]: number };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
    return (
        <div className="text-gray-500 dark:text-gray-400 text-sm p-2">
            {Object.keys(typingUsers).join(", ")}{" "}
            {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
        </div>
    );
};

export default TypingIndicator;
