"use client";
import { useState, useEffect, useRef } from "react";

let webSocket: WebSocket;
if (typeof window !== "undefined") {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  webSocket = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
  setInterval(() => {
    if (webSocket.readyState !== webSocket.OPEN) {
      webSocket = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      return;
    }

    webSocket.send(`{"event":"ping"}`);
  }, 29000);
}

interface Message {
  event: "message";
  user: string;
  text: string;
  timestamp: string;
}

interface TypingEvent {
  event: "typing";
  user: string;
}

type ServerMessage = Message | TypingEvent;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user] = useState(() => (Math.random() > 0.5 ? "User 1" : "User 2"));
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastTypingTimeRef = useRef<number>(0);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    webSocket.onmessage = (event) => {
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
      }
    };
  }, [user]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const message = {
      event: "message",
      user,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    webSocket.send(JSON.stringify(message));
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mt-8">Real-Time Chat</h1>

      <div className="w-full max-w-3xl mt-6 flex flex-col bg-white shadow-md rounded-lg">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)] border-b border-gray-300"
        >
          {messages.length === 0 && (
            <div className="text-gray-500 text-center">No messages yet.</div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${message.user === user ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`flex items-center space-x-3 max-w-[60%] ${message.user === user ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                {message.user !== user && (
                  <img
                    src={`https://api.dicebear.com/6.x/personas/svg?seed=${message.user}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="text-sm">
                  <div
                    className={`text-sm font-semibold mb-1 text-black ${message.user === user ? "text-right" : "text-left"
                      }`}
                  >
                    {message.user}
                  </div>
                  <div
                    className={`p-2 rounded-lg break-words ${message.user === user
                      ? "bg-blue-100 text-blue-700 text-right"
                      : "bg-gray-200 text-gray-800 text-left"
                      }`}
                  >
                    {message.text}
                  </div>
                  <div
                    className={`text-xs text-gray-500 ${message.user === user ? "text-right" : "text-left"
                      }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
                {message.user === user && (
                  <img
                    src={`https://api.dicebear.com/6.x/personas/svg?seed=${message.user}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
          {Object.keys(typingUsers).length > 0 && (
            <div className="text-gray-500 text-sm p-2">
              {Object.keys(typingUsers).join(", ")}{" "}
              {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
            </div>
          )}
        </div>
        <div className="p-4 flex items-center bg-gray-50">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              const now = Date.now();
              if (now - lastTypingTimeRef.current > 1000) {
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
            className="ml-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
