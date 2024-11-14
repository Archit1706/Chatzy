"use client"
import { useState, useEffect } from 'react';

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
  user: string;
  text: string;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user] = useState(() => (Math.random() > 0.5 ? 'User 1' : 'User 2'));

  useEffect(() => {
    webSocket.onmessage = (event) => {
      if (event.data === "connection established") return;
      const messageData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const message = {
      user,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    webSocket.send(JSON.stringify(message));
    setNewMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mt-8">Real-Time Chat</h1>

      <div className="w-full max-w-3xl mt-6 flex flex-col bg-white shadow-md rounded-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 border-b border-gray-300">
          {messages.length === 0 && (
            <div className="text-gray-500 text-center">No messages yet.</div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${message.user === 'User 1' ? 'justify-start' : 'justify-end'}`}
            >
              <div className="flex items-start space-x-3 max-w-[60%]">
                {message.user === 'User 1' && (
                  <img
                    src={`https://api.dicebear.com/6.x/personas/svg?seed=${message.user}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold text-sm text-gray-700">{message.user}</div>
                  <div
                    className={`p-2 rounded-lg break-words ${message.user === 'User 1'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-200 text-gray-800'
                      }`}
                  >
                    {message.text}
                  </div>
                  <div className="text-xs text-gray-500">{message.timestamp}</div>
                </div>
                {message.user === 'User 2' && (
                  <img
                    src={`https://api.dicebear.com/6.x/personas/svg?seed=${message.user}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center bg-gray-50">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
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
