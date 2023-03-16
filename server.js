const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const rolePicks = new Map();

server.on('connection', (socket) => {
  console.log('Client connected');

  socket.send(JSON.stringify({ type: 'initialRoles', roles: Array.from(rolePicks.values()) }));

  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'resetData') {
      console.log('Resetting server data');

      // Clear the rolePicks Map
      rolePicks.clear();

      // Broadcast the reset data message to all connected clients
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'resetData' }));
        }
      });
    } else {
      console.log(`${data.nickname} picked the ${data.role} role`);

      if (rolePicks.has(data.nickname)) {
        const existingRoles = rolePicks.get(data.nickname).roles;
        if (!existingRoles.includes(data.role)) {
          existingRoles.push(data.role);
        }
      } else {
        rolePicks.set(data.nickname, { nickname: data.nickname, roles: [data.role] });
      }

      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'newRole', nickname: data.nickname, role: data.role }));
        }
      });
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});