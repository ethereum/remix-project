import * as http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import EventEmitter from 'events';
import { RequestArguments } from '../types';
import { json } from 'stream/consumers';

// Forwarding WebSocket client
let connectedWebSocket: WebSocket | null = null;

// Helper function to send JSON responses
const sendResponse = (response: http.ServerResponse, data: any, statusCode = 200) => {
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
};

// Handle incoming JSON-RPC requests and forward to WebSocket client
export const handleRequest = async (
    jsonRpcPayload: RequestArguments
): Promise<any> => {
    if (!connectedWebSocket || connectedWebSocket.readyState !== WebSocket.OPEN) {
        throw new Error('No active WebSocket connection to forward request');
    }

    // Send the payload to the WebSocket client and wait for response
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for WebSocket response')), 240000); // 10 seconds timeout

        connectedWebSocket && connectedWebSocket.once('message', (data: string) => {

            if (Buffer.isBuffer(data)) {
                data = data.toString('utf-8');
            }

            clearTimeout(timeout);
            try {
                const response = JSON.parse(data);
                if (response.id === jsonRpcPayload.id) {
                    //console.log('response from WebSocket client:', response);
                    resolve(response.result);
                } else {
                    console.log('ignore response from WebSocket client:', data);
                    //reject(new Error('Invalid response ID'));
                }
            } catch (error) {
                reject(error);
            }
        });

        connectedWebSocket && connectedWebSocket.send(JSON.stringify(jsonRpcPayload), (err) => {
            if (err) {
                clearTimeout(timeout);
                reject(err);
            }
        });
    });
};

export const startRPCServer = (eventEmitter: EventEmitter) => {

    // Create the HTTP server with CORS
    const httpServer = http.createServer(async (req, res) => {
        // Add CORS headers
        const corsOptions = {
            origin: '*', // Allow all origins; adjust as needed for your application
            methods: 'POST',
            allowedHeaders: ['Content-Type'],
        };

        cors(corsOptions)(req as any, res as any, async () => {
            if (req.method === 'POST' && req.url === '/') {
                let body = '';
                req.on('data', (chunk) => (body += chunk.toString()));
                req.on('end', async () => {
                    try {
                        const jsonRpcRequest = JSON.parse(body);

                        if (
                            jsonRpcRequest.jsonrpc !== '2.0' ||
                            !jsonRpcRequest.method ||
                            typeof jsonRpcRequest.method !== 'string'
                        ) {
                            throw new Error('Invalid JSON-RPC request');
                        }

                        const result = await handleRequest({
                            method: jsonRpcRequest.method,
                            jsonrpc: '2.0',
                            params: jsonRpcRequest.params || [],
                            id: jsonRpcRequest.id
                        });

                        const jsonResponse = {
                            jsonrpc: '2.0',
                            result: result,
                            id: jsonRpcRequest.id,
                        };
                        sendResponse(res, jsonResponse);
                    } catch (error) {
                        const jsonResponse = {
                            jsonrpc: '2.0',
                            error: {
                                code: -32600,
                                message: (error as any).message,
                            },
                            id: null,
                        };
                        sendResponse(res, jsonResponse, 400);
                    }
                });
            } else {
                sendResponse(res, { error: 'Only POST requests are allowed' }, 405);
            }
        });
    });

    // Create the WebSocket server
    const wsServer = new WebSocketServer({ port: 8546 }); // WebSocket server on port 8546

    wsServer.on('connection', (ws) => {
        console.log('WebSocket client connected');
        if (connectedWebSocket?.OPEN) {
            console.log(connectedWebSocket.url)
            connectedWebSocket.removeAllListeners()
            connectedWebSocket.close()
        }

        connectedWebSocket = ws;
        eventEmitter.emit('connected', true);

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            connectedWebSocket = null;
            eventEmitter.emit('connected', false);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error.message);
            connectedWebSocket = null;
            eventEmitter.emit('connected', false);
        });
    });

    // Start the HTTP server
    const HTTP_PORT = 8545; // Default Ethereum JSON-RPC port
    const webserver = httpServer.listen(HTTP_PORT, () => {
        console.log(`Ethereum RPC server running on http://localhost:` + JSON.stringify((webserver.address() as any).port));
        console.log(`WebSocket server running on ws://localhost:` + JSON.stringify((wsServer.address() as any).port));
    });

}
