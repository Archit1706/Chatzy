// hooks/useChatWebSocket.ts
import { useState, useEffect } from "react";
import { ServerMessage, Message } from "../types";

const useChatWebSocket = (user: string, otherUser: string) => {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: number }>({});
    const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
    const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
    const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({
        [user]: user,
        [otherUser]: otherUser,
    });

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
    }, [user, otherUser]);

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
    };
};

export default useChatWebSocket;
