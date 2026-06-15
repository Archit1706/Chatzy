// hooks/useChatWebSocket.ts
import { useState, useEffect } from "react";
import { ServerMessage, Message, ConnectionStatus } from "../types";

const useChatWebSocket = (user: string, otherUser: string) => {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: number }>({});
    const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
    const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>("connecting");
    const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({
        [user]: user,
        [otherUser]: otherUser,
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
            setWebSocket(ws);
            setConnectionStatus("connecting");

            ws.onopen = () => {
                setConnectionStatus("connected");
                ws.send(JSON.stringify({ event: "register", user }));
            };

            ws.onclose = () => setConnectionStatus("disconnected");
            ws.onerror = () => setConnectionStatus("disconnected");

            ws.onmessage = (event) => {
                if (event.data === "connection established") return;
                const messageData: ServerMessage = JSON.parse(event.data);

                if (messageData.event === "message") {
                    const incoming: Message = { ...messageData };
                    if (incoming.ttl && incoming.ttl > 0) {
                        incoming.expiresAt = Date.now() + incoming.ttl * 1000;
                    }
                    setMessages((prevMessages) => [...prevMessages, incoming]);
                } else if (messageData.event === "typing") {
                    const typingUser = messageData.user;
                    if (typingUser !== user) {
                        setTypingUsers((prevTypingUsers) => {
                            const newTypingUsers = { ...prevTypingUsers };
                            if (newTypingUsers[typingUser]) {
                                clearTimeout(newTypingUsers[typingUser]);
                            }
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
                    const { messageIds } = messageData;
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
                } else if (messageData.event === "reaction") {
                    const { messageId, emoji, user: reactor } = messageData;
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) => {
                            if (msg.id !== messageId) return msg;
                            const reactions = msg.reactions ? [...msg.reactions] : [];
                            const existing = reactions.findIndex(
                                (r) => r.user === reactor && r.emoji === emoji
                            );
                            if (existing >= 0) {
                                reactions.splice(existing, 1);
                            } else {
                                reactions.push({ emoji, user: reactor });
                            }
                            return { ...msg, reactions };
                        })
                    );
                } else if (messageData.event === "clear") {
                    setMessages([]);
                    setReadMessageIds([]);
                }
            };

            // Keep-alive ping
            const interval = setInterval(() => {
                if (ws.readyState !== ws.OPEN) {
                    clearInterval(interval);
                    return;
                }
                ws.send(`{"event":"ping"}`);
            }, 29000);

            return () => {
                ws.close();
                clearInterval(interval);
            };
        }
    }, [user, otherUser]);

    // Sweep expired ephemeral messages
    useEffect(() => {
        const sweep = setInterval(() => {
            const now = Date.now();
            setMessages((prev) => {
                const filtered = prev.filter(
                    (m) => !m.expiresAt || m.expiresAt > now
                );
                return filtered.length === prev.length ? prev : filtered;
            });
        }, 1000);
        return () => clearInterval(sweep);
    }, []);

    return {
        webSocket,
        messages,
        setMessages,
        typingUsers,
        setTypingUsers,
        onlineUsers,
        setOnlineUsers,
        readMessageIds,
        setReadMessageIds,
        userAvatars,
        setUserAvatars,
        connectionStatus,
    };
};

export default useChatWebSocket;
