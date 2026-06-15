# Chatzy — Ephemeral Real-Time Chat

> 🔒 Nothing is saved on the server. Messages live only inside your session.

**Live demo:** [https://chat247.vercel.app](https://chat247.vercel.app)

Chatzy is a modern, minimalistic real-time chat app built with Next.js and WebSocket. It pairs a clean, glass-style UI with a privacy-first ephemeral model — no database, no logs, no storage.

## ✨ Features

### Privacy & ephemerality
- **Zero-persistence server** — messages are relayed in-memory only
- **Per-message self-destruct** — choose Off / 10s / 30s / 1m / 5m with a live countdown
- **Clear chat** — wipe the conversation for everyone with one click
- **Connection status pill** — see Connecting / Connected / Offline at a glance

### Messaging
- **Real-time delivery** over WebSocket
- **Reply to messages** with an inline quote preview
- **Emoji reactions** with grouped counts; tap to toggle
- **Emoji picker** in the composer
- **Copy any message** to your clipboard with one click
- **Search messages** with inline highlight
- **Auto-grow textarea** — Enter to send, Shift+Enter for newline
- **Character counter** (2000 chars per message)
- **Typing indicators** with animated dots
- **Read receipts** (✓ Delivered / ✓✓ Read)
- **Unread badge** in the tab title when the window is hidden
- **Sound notification** (toggleable) on incoming messages

### Look & feel
- **Minimalist modern UI** — slate palette, rounded-2xl surfaces, glass header, subtle gradient backdrop
- **Smooth bubble entrance animation**
- **Dark mode** toggle
- **Customizable DiceBear avatars** with a redesigned profile modal (Esc to close)
- **Fully responsive** across desktop and mobile

### SEO & PWA polish
- Full Open Graph + Twitter Card metadata
- Canonical URL, robots, keywords, and theme-color
- SVG favicon and web app manifest (installable)

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
