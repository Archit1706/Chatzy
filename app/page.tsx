// page.tsx
"use client"
import React, { useState, useRef, useEffect } from "react";
import { generateUniqueId } from "@/utils/generateUniqueId";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import AvatarModal from "@/components/AvatarModal";
import useChatWebSocket from "@/hooks/useChatWebSocket";

const Index = () => {
  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user") || "User1";
      return userParam;
    }
    return "User1";
  });

  const otherUser = user === "User1" ? "User2" : "User1";

  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<string | null>(null);
  const [ttl, setTtl] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const lastTypingTimeRef = useRef<number>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  const avatarOptions = ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"];

  const {
    webSocket,
    messages,
    typingUsers,
    onlineUsers,
    readMessageIds,
    setReadMessageIds,
    userAvatars,
    setUserAvatars,
  } = useChatWebSocket(user, otherUser);

  // Play a short beep on incoming messages from others
  const playBeep = () => {
    if (!soundOn || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      osc.type = "sine";
      gain.gain.value = 0.08;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = () => ctx.close();
    } catch {
      // ignore audio errors
    }
  };

  useEffect(() => {
    // Detect newly arrived messages from the other user
    if (messages.length > prevMessageCountRef.current) {
      const fresh = messages.slice(prevMessageCountRef.current);
      const incoming = fresh.filter((m) => m.user !== user);
      if (incoming.length > 0) {
        playBeep();
        if (typeof document !== "undefined" && document.hidden) {
          setUnreadCount((c) => c + incoming.length);
        }
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, user, soundOn]);

  // Reflect unread count in the document title
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = `Chatzy — chat with ${otherUser}`;
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
  }, [unreadCount, otherUser]);

  // Clear unread badge when tab becomes visible
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisible = () => {
      if (!document.hidden) setUnreadCount(0);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    const unreadMessages = messages.filter(
      (msg) => msg.user === otherUser && !readMessageIds.includes(msg.id)
    );

    if (
      unreadMessages.length > 0 &&
      webSocket &&
      webSocket.readyState === WebSocket.OPEN
    ) {
      const unreadMessageIds = unreadMessages.map((msg) => msg.id);
      webSocket.send(
        JSON.stringify({ event: "read", messageIds: unreadMessageIds, user })
      );
      setReadMessageIds((prev) => [...prev, ...unreadMessageIds]);
    }
  }, [messages, otherUser, readMessageIds, user, webSocket, setReadMessageIds]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const message = {
      event: "message",
      id: generateUniqueId(),
      user,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      ttl: ttl > 0 ? ttl : undefined,
    };
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
    setNewMessage("");
  };

  const sendReaction = (messageId: string, emoji: string) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(
        JSON.stringify({ event: "reaction", messageId, emoji, user })
      );
    }
  };

  const clearChat = () => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ event: "clear", user }));
    }
  };

  const changeAvatar = (newAvatarSeed: string) => {
    setUserAvatars((prev) => ({ ...prev, [user]: newAvatarSeed }));
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
        <ChatHeader
          otherUser={otherUser}
          onlineUsers={onlineUsers}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          onClearChat={clearChat}
        />
        <div className="w-full max-w-3xl mt-6 flex flex-col bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <ChatMessages
            messages={messages}
            user={user}
            typingUsers={typingUsers}
            chatContainerRef={chatContainerRef}
            userAvatars={userAvatars}
            setModalUser={setModalUser}
            setShowModal={setShowModal}
            onReact={sendReaction}
          />
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            lastTypingTimeRef={lastTypingTimeRef}
            user={user}
            webSocket={webSocket}
            ttl={ttl}
            setTtl={setTtl}
          />
        </div>
        <AvatarModal
          showModal={showModal}
          setShowModal={setShowModal}
          modalUser={modalUser}
          userAvatars={userAvatars}
          avatarOptions={avatarOptions}
          changeAvatar={changeAvatar}
          user={user}
        />
      </div>
    </div>
  );
};

export default Index;
