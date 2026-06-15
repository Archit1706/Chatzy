# Chatzy - Real-Time Chat Application

Chatzy is a modern real-time chat application built with Next.js and WebSocket technology. It features a clean, responsive interface with support for real-time messaging, typing indicators, read receipts, and customizable avatars.

## ✨ Features

- **Real-time Communication**: Instant message delivery using WebSocket technology
- **Ephemeral by Design**: Nothing is persisted on the server — messages live only in active sessions
- **Self-Destruct Timer**: Optional per-message TTL (10s / 30s / 1m / 5m) with live countdown
- **Emoji Reactions**: React to any message with quick emojis; tap again to remove
- **Emoji Picker**: Insert emojis directly into your messages
- **Clear Chat**: Wipe the conversation for everyone with one click
- **Sound Notifications**: Subtle beep on incoming messages (toggleable)
- **Unread Badge**: Tab title shows unread count when the window is hidden
- **Typing Indicators**: See when other users are typing
- **Read Receipts**: Know when your messages have been read
- **Online Status**: Track user online/offline status in real-time
- **Dark Mode**: Toggle between light and dark themes
- **Customizable Avatars**: Choose and customize your avatar from multiple options
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15.0.3
- **Backend**: Express.js with WebSocket (ws) implementation
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Avatar Service**: DiceBear API

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Archit1706/chatzy.git
cd chatzy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 Usage

1. Open the application in two different browser windows
2. Add the user parameter to the URL:
   - First window: `http://localhost:3000?user=User1`
   - Second window: `http://localhost:3000?user=User2`
3. Start chatting!

## 🔧 Configuration

The application uses several configuration files:

- **Next.js Configuration**: Configured in `next.config.ts`
- **TypeScript Configuration**: Set up in `tsconfig.json`
- **Tailwind Configuration**: Defined in `tailwind.config.ts`
- **ESLint Configuration**: Managed in `.eslintrc.json`

## 🌟 Key Components

### WebSocket Hook
The `useChatWebSocket` hook manages all real-time communication:

```typescript:hooks/useChatWebSocket.ts
startLine: 5
endLine: 115
```

### Server Implementation
The WebSocket server handles all real-time events:
```javascript:server.js
startLine: 1
endLine: 143
```

## 🔐 Environment Variables

No environment variables are required for basic setup. The application runs on port 3000 by default.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.
