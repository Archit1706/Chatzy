// page.tsx
"use client"
import React, { useState, useRef, useEffect } from "react";
import { generateUniqueId } from "@/utils/generateUniqueId";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import AvatarModal from "@/components/AvatarModal";
import useChatWebSocket from "@/hooks/useChatWebSocket";
import { Message, ReplyRef } from "@/types";

const Index = () => {
  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("user") || "User1";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);

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
    connectionStatus,
  } = useChatWebSocket(user, otherUser);

  useEffect(() => {
    // Reflect Tailwind `dark:` styling on <html> too (for scrollbars, body bg)
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
      // ignore
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = `Chatzy — chat with ${otherUser}`;
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
  }, [unreadCount, otherUser]);

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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ttl: ttl > 0 ? ttl : undefined,
      replyTo: replyTo || undefined,
    };
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
    setNewMessage("");
    setReplyTo(null);
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

  const startReply = (msg: Message) => {
    setReplyTo({ id: msg.id, user: msg.user, text: msg.text });
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
      <div className="min-h-screen flex flex-col items-center">
        <ChatHeader
          otherUser={otherUser}
          onlineUsers={onlineUsers}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          onClearChat={clearChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          connectionStatus={connectionStatus}
          userAvatar={userAvatars[user] || user}
          onAvatarClick={() => {
            setModalUser(user);
            setShowModal(true);
          }}
        />
        <div className="w-full max-w-3xl mt-4 px-4">
          <div className="flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
            <ChatMessages
              messages={messages}
              user={user}
              typingUsers={typingUsers}
              chatContainerRef={chatContainerRef}
              userAvatars={userAvatars}
              setModalUser={setModalUser}
              setShowModal={setShowModal}
              onReact={sendReaction}
              onReply={startReply}
              searchQuery={searchQuery}
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
              replyTo={replyTo}
              clearReply={() => setReplyTo(null)}
            />
          </div>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3 mb-6">
            🔒 Chatzy is ephemeral. Messages are never stored on the server.
          </p>
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
