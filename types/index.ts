// types/index.ts
export interface Message {
    event: "message";
    id: string;
    user: string;
    text: string;
    timestamp: string;
    read?: boolean;
}

export interface TypingEvent {
    event: "typing";
    user: string;
}

export type ServerMessage =
    | Message
    | TypingEvent
    | { event: "read"; messageIds: string[]; user: string }
    | { event: "user_online"; user: string }
    | { event: "user_offline"; user: string }
    | { event: "online_users"; users: string[] }
    | { event: "avatar_change"; user: string; avatarSeed: string };
