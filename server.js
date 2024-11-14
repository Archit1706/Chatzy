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

      if (parsedMessage.event === "message") {
        const broadcastMessage = JSON.stringify({
          event: "message",
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

      // Handle other events if needed
    });

    ws.on('close', () => {
      clients.delete(ws);
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
