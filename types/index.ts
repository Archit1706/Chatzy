// types/index.ts
export interface Reaction {
    emoji: string;
    user: string;
}

export interface Message {
    event: "message";
    id: string;
    user: string;
    text: string;
    timestamp: string;
    read?: boolean;
    ttl?: number; // self-destruct in seconds, undefined = persistent (session only)
    expiresAt?: number; // computed local epoch ms when message should disappear
    reactions?: Reaction[];
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
    | { event: "avatar_change"; user: string; avatarSeed: string }
    | { event: "reaction"; messageId: string; emoji: string; user: string }
    | { event: "clear"; user: string };
