import createDebugger from 'debug';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

const debug = createDebugger('express-api:messaging');


let wss;
let clients = new Map();

function createWSServer(httpServer) {
    debug('Creating WebSocket server');
    const wss = new WebSocketServer({
        server: httpServer,
    });

    // Handle new client connections.
    wss.on('connection', function (ws, req) {
        console.debug('ws req', new URLSearchParams(req.url.replace(/.*\?/, '')).get('userId'));
        debug('New WebSocket client connected');
        // id unique pour chaque client
        const clientId = uuidv4() ;
        clients.set(clientId, ws);

      
        // Listen for messages sent by clients.
        ws.on('message', (message) => {
            // Make sure the message is valid JSON.
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch (err) {
                // Send an error message to the client with "ws" if you want...
                return debug('Invalid JSON message received from client');
            }

            // Handle the message.
            onMessageReceived(ws, parsedMessage);
        });

        // Clean up disconnected clients.
        ws.on('close', () => {
          clients.delete(clientId);
        });
    });
}

export function broadcastMessage(message) {
    debug(
        `Broadcasting message to all connected clients: ${JSON.stringify(message)}`
    );
    for (const client of clients) {
        client.send(JSON.stringify(message));
    }
}


const sendMessageToClient = (clientId, message) => {
  const client = clients.get(clientId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
};

export { createWSServer, sendMessageToClient };


function onMessageReceived(message) {
    debug(`Received WebSocket message: ${JSON.stringify(message)}`);
}



