const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

console.log('🚀 Signaling server started on ws://localhost:8080');

wss.on('connection', (ws) => {
  let clientId = null;

  console.log('👤 New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'register':
          clientId = data.clientId;
          clients.set(clientId, ws);
          console.log(`✅ Client registered: ${clientId}`);
          
          // Send list of other clients
          const otherClients = Array.from(clients.keys()).filter(id => id !== clientId);
          ws.send(JSON.stringify({
            type: 'clients',
            clients: otherClients
          }));
          
          // Notify other clients about new user
          broadcast({
            type: 'user-joined',
            clientId: clientId
          }, clientId);
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward signaling messages to target client
          const targetClient = clients.get(data.target);
          if (targetClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(JSON.stringify({
              ...data,
              from: clientId
            }));
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (clientId) {
      clients.delete(clientId);
      console.log(`👋 Client disconnected: ${clientId}`);
      
      // Notify other clients
      broadcast({
        type: 'user-left',
        clientId: clientId
      }, clientId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcast(message, excludeClientId) {
  clients.forEach((client, id) => {
    if (id !== excludeClientId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log('📡 Waiting for connections...');