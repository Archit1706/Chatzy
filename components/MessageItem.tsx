// components/MessageItem.tsx
import React from "react";
import { Message } from "../types";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  userAvatars: { [key: string]: string };
  setModalUser: React.Dispatch<React.SetStateAction<string | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  userAvatars,
  setModalUser,
  setShowModal,
}) => {
  return (
    <div
      className={`flex items-start ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex items-center space-x-3 max-w-[60%]`}>
        {isOwnMessage ? (
          <>
            {/* Message Content */}
            <div className="text-sm text-right">
              <div className="text-sm font-semibold mb-1 text-black dark:text-gray-100">
                {message.user}
              </div>
              <div className="p-2 rounded-lg break-words bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {message.text}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {message.read ? "Read" : "Delivered"}
              </div>
            </div>
            {/* Avatar Image */}
            <img
              src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[message.user]}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => {
                setModalUser(message.user);
                setShowModal(true);
              }}
            />
          </>
        ) : (
          <>
            {/* Avatar Image */}
            <img
              src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[message.user]}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => {
                setModalUser(message.user);
                setShowModal(true);
              }}
            />
            {/* Message Content */}
            <div className="text-sm text-left">
              <div className="text-sm font-semibold mb-1 text-black dark:text-gray-100">
                {message.user}
              </div>
              <div className="p-2 rounded-lg break-words bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {message.text}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
