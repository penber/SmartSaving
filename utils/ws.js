import createDebugger from 'debug';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const debug = createDebugger('express-api:messaging');

let wss;
let clients = new Map();

function createWSServer(httpServer) {
    debug('Creating WebSocket server');
    wss = new WebSocketServer({
        server: httpServer,
    });

    wss.on('connection', function (ws, req) {
        const token = new URLSearchParams(req.url.replace(/.*\?/, '')).get('token');
        if (!token) {
            debug('No token provided by client');
            ws.close();
            return;
        }

        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            debug('Invalid token provided by client');
            ws.close();
            return;
        }

        debug('New WebSocket client connected with userId:', userId);
        clients.set(userId, ws);

        ws.on('message', (message) => {
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch (err) {
                return debug('Invalid JSON message received from client');
            }
            onMessageReceived(ws, parsedMessage);
        });

        ws.on('close', () => {
            clients.delete(userId);
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


const sendMessageToClient = (userId, message) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    } else {
      debug(`WebSocket client with userId ${userId} not found or not open`);
    }
  };
  

export { createWSServer, sendMessageToClient };


function onMessageReceived(message) {
    debug(`Received WebSocket message: ${JSON.stringify(message)}`);
}



