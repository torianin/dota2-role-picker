const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

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