"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  event: "message";
  id: string;
  user: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

interface TypingEvent {
  event: "typing";
  user: string;
}

type ServerMessage =
  | Message
  | TypingEvent
  | { event: "read"; messageIds: string[]; user: string }
  | { event: "user_online"; user: string }
  | { event: "user_offline"; user: string }
  | { event: "online_users"; users: string[] }
  | { event: "avatar_change"; user: string; avatarSeed: string };

const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

const Index = () => {
  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user") || "User1";
      console.log("User parameter from URL:", userParam);
      return userParam;
    }
    return "User1";
  });
  const otherUser = user === "User1" ? "User2" : "User1";
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastTypingTimeRef = useRef<number>(0);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: number }>({});
  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
  const [darkMode, setDarkMode] = useState(false);
  const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({
    [user]: user,
    [otherUser]: otherUser,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<string | null>(null);

  const avatarOptions = ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      setWebSocket(ws);

      ws.onopen = () => {
        ws.send(JSON.stringify({ event: "register", user }));
      };

      ws.onmessage = (event) => {
        if (event.data === "connection established") return;
        const messageData: ServerMessage = JSON.parse(event.data);
        if (messageData.event === "message") {
          setMessages((prevMessages) => [...prevMessages, messageData]);
        } else if (messageData.event === "typing") {
          const typingUser = messageData.user;
          if (typingUser !== user) {
            setTypingUsers((prevTypingUsers) => {
              const newTypingUsers = { ...prevTypingUsers };
              // Clear existing timeout if any
              if (newTypingUsers[typingUser]) {
                clearTimeout(newTypingUsers[typingUser]);
              }
              // Set a timeout to remove the typing indicator after 3 seconds
              newTypingUsers[typingUser] = window.setTimeout(() => {
                setTypingUsers((prev) => {
                  const updated = { ...prev };
                  delete updated[typingUser];
                  return updated;
                });
              }, 3000);
              return newTypingUsers;
            });
          }
        } else if (messageData.event === "read") {
          // Update the messages to mark them as read
          const { messageIds, user: readerUser } = messageData;
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (messageIds.includes(msg.id) && msg.user === user) {
                return { ...msg, read: true };
              }
              return msg;
            })
          );
        } else if (messageData.event === "user_online") {
          setOnlineUsers((prev) => ({ ...prev, [messageData.user]: true }));
        } else if (messageData.event === "user_offline") {
          setOnlineUsers((prev) => {
            const updated = { ...prev };
            delete updated[messageData.user];
            return updated;
          });
        } else if (messageData.event === "online_users") {
          const users = messageData.users;
          setOnlineUsers((prev) => {
            const updated = { ...prev };
            users.forEach((u) => {
              updated[u] = true;
            });
            return updated;
          });
        } else if (messageData.event === "avatar_change") {
          const { user: changedUser, avatarSeed } = messageData;
          setUserAvatars((prev) => ({ ...prev, [changedUser]: avatarSeed }));
        }
      };

      // Keep-alive ping
      const interval = setInterval(() => {
        if (ws.readyState !== ws.OPEN) {
          // Attempt to reconnect or handle disconnection
          // For simplicity, we'll just clear the interval here
          clearInterval(interval);
          return;
        }
        ws.send(`{"event":"ping"}`);
      }, 29000);

      // Cleanup on component unmount
      return () => {
        ws.close();
        clearInterval(interval);
      };
    }
  }, [user]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Send read receipts for unread messages from the other user
    const unreadMessages = messages.filter(
      (msg) => msg.user === otherUser && !readMessageIds.includes(msg.id)
    );

    if (
      unreadMessages.length > 0 &&
      webSocket &&
      webSocket.readyState === WebSocket.OPEN
    ) {
      const unreadMessageIds = unreadMessages.map((msg) => msg.id);
      // Send read event
      webSocket.send(
        JSON.stringify({ event: "read", messageIds: unreadMessageIds, user })
      );
      // Update local state
      setReadMessageIds((prev) => [...prev, ...unreadMessageIds]);
    }
  }, [messages, otherUser, readMessageIds, user, webSocket]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const message = {
      event: "message",
      id: generateUniqueId(),
      user,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
    setNewMessage("");
  };

  const changeAvatar = (newAvatarSeed: string) => {
    // Update own avatar
    setUserAvatars((prev) => ({ ...prev, [user]: newAvatarSeed }));
    // Send avatar_change event to server
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(
        JSON.stringify({ event: "avatar_change", user, avatarSeed: newAvatarSeed })
      );
    }
    setShowModal(false);
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
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

        <div className="w-full max-w-3xl mt-6 flex flex-col bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)] border-b border-gray-300 dark:border-gray-700"
          >
            {messages.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-center">
                No messages yet.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${message.user === user ? "justify-end" : "justify-start"
                  }`}
              >
                <div className={`flex items-center space-x-3 max-w-[60%]`}>
                  {message.user === user ? (
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
            ))}
            {Object.keys(typingUsers).length > 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm p-2">
                {Object.keys(typingUsers).join(", ")}{" "}
                {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
              </div>
            )}
          </div>
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
                  // Send typing event
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

        {/* Modal */}
        {showModal && modalUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setShowModal(false)}
            ></div>
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 z-10 max-w-md w-full">
              <div className="flex flex-col items-center">
                <img
                  src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[modalUser]}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full mb-4"
                />
                <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">
                  {modalUser}
                </h2>
                {/* Mock information */}
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This is some mock information about {modalUser}.
                </p>
                {modalUser === user && (
                  <div className="w-full">
                    <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                      Choose your avatar
                    </h3>
                    <div className="flex space-x-4">
                      {avatarOptions.map((avatarSeed) => (
                        <img
                          key={avatarSeed}
                          src={`https://api.dicebear.com/6.x/personas/svg?seed=${avatarSeed}`}
                          alt="Avatar Option"
                          className="w-16 h-16 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500"
                          onClick={() => changeAvatar(avatarSeed)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
