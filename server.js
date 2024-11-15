// server.js
const { parse } = require('url');
const express = require("express");
const next = require('next');
const WebSocket = require('ws');
const { WebSocketServer } = require('ws');

const app = express();
const server = app.listen(3000);
const wss = new WebSocketServer({ noServer: true });
const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const clients = new Set();
const userConnections = new Map();

nextApp.prepare().then(() => {
  app.use((req, res, next) => {
    nextApp.getRequestHandler()(req, res, parse(req.url, true));
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    ws.on('message', (message, isBinary) => {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.event === "ping") return;

      if (parsedMessage.event === "register") {
        ws.user = parsedMessage.user;
        userConnections.set(ws.user, ws);

        // Send the list of online users to the newly connected user
        const onlineUsers = Array.from(userConnections.keys()).filter(u => u !== ws.user);
        if (onlineUsers.length > 0) {
          ws.send(JSON.stringify({ event: "online_users", users: onlineUsers }));
        }

        // Notify others that this user is online
        const onlineMessage = JSON.stringify({ event: "user_online", user: ws.user });
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(onlineMessage, { binary: isBinary });
          }
        });
        return;
      }

      if (parsedMessage.event === "typing") {
        // Broadcast typing event to other clients
        const typingMessage = JSON.stringify({ event: "typing", user: parsedMessage.user });
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(typingMessage, { binary: isBinary });
          }
        });
        return;
      }

      if (parsedMessage.event === "read") {
        const { messageIds, user: readerUser } = parsedMessage;
        // Get the other user
        const otherUser = Array.from(userConnections.keys()).find((u) => u !== readerUser);

        if (otherUser && userConnections.has(otherUser)) {
          const senderWs = userConnections.get(otherUser);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({ event: "read", messageIds, user: readerUser }));
          }
        }
        return;
      }

      if (parsedMessage.event === "message") {
        const broadcastMessage = JSON.stringify({
          event: "message",
          id: parsedMessage.id,
          user: parsedMessage.user,
          text: parsedMessage.text,
          timestamp: parsedMessage.timestamp,
        });

        console.log(`Message received: ${broadcastMessage}`);
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMessage, { binary: isBinary });
          }
        });
        return;
      }

      if (parsedMessage.event === "avatar_change") {
        const { user: changedUser, avatarSeed } = parsedMessage;

        // Broadcast avatar change to all other clients
        const avatarChangeMessage = JSON.stringify({
          event: "avatar_change",
          user: changedUser,
          avatarSeed: avatarSeed,
        });

        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(avatarChangeMessage, { binary: isBinary });
          }
        });
        return;
      }

      // Handle other events if needed
    });

    ws.on('close', () => {
      clients.delete(ws);
      if (ws.user) {
        userConnections.delete(ws.user);

        // Notify others that this user is offline
        const offlineMessage = JSON.stringify({ event: "user_offline", user: ws.user });
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(offlineMessage);
          }
        });
      }
      console.log('Client disconnected');
    });
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "/", true);

    if (pathname === "/_next/webpack-hmr") {
      nextApp.getUpgradeHandler()(req, socket, head);
    }

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });
});
