const WebSocket = require('ws');

/**
 * WebSocket service for real-time dashboard updates
 * Provides live notifications for robot events and bounty status changes
 */
class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server, path: '/ws' });
        this.clients = new Set();
        
        this.wss.on('connection', (ws, req) => {
            this.clients.add(ws);
            console.log(`WebSocket client connected (total: ${this.clients.size})`);
            
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to MyZubster Gateway real-time feed',
                timestamp: new Date().toISOString(),
                clientCount: this.clients.size
            }));
            
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log(`WebSocket client disconnected (total: ${this.clients.size})`);
            });
            
            ws.on('error', (err) => {
                console.error('WebSocket error:', err.message);
                this.clients.delete(ws);
            });
        });
        
        console.log('WebSocket service initialized on /ws');
    }
    
    broadcast(type, data) {
        const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
    
    getClientCount() {
        return this.clients.size;
    }
}

module.exports = WebSocketService;
