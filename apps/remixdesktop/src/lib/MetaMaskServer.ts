import * as http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import EventEmitter from 'events'
import { RequestArguments } from '../types'
import path from 'path'
import express from 'express'
import cbor from 'cbor'

import { findAvailablePort } from '../utils/portFinder'
import { isPackaged } from '../main'
import { isE2ELocal } from '../main'

// We will hold onto the pending requests here.
// Key: The request ID; Value: an object containing { resolve, reject, method } 
const pendingRequests: Record<
  number | string,
  {
    resolve: (value: any) => void
    reject: (reason: any) => void
    method?: string
  }
> = {}

let connectedWebSocket: WebSocket | null = null

// -------------------------
// Single top-level message handler
// -------------------------
function setupMessageHandler(ws: WebSocket, eventEmitter: EventEmitter) {
  ws.on('message', (data: Buffer | string) => {
    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8')
    }

    let parsed: { id: any; error: any; result: any; type: string | symbol; payload: any }
    try {
      parsed = parseWithBigInt(data)
    } catch (err) {
      console.error('Could not parse incoming WebSocket message:', err)
      return
    }

    // If the message has an 'id', try to find a pending request
    if (typeof parsed?.id !== 'undefined') {
      const requestId = parsed.id
      const pendingReq = pendingRequests[requestId]
      if (pendingReq) {
        // Found a matching pending request.
        // Clear it from the queue to avoid memory leak
        delete pendingRequests[requestId]

        // If there's an error in the response
        if (parsed.error) {
          const errorObj = { data: parsed.error }
          // Your same logic as before
          if (errorObj.data && errorObj.data.originalError) {
            pendingReq.resolve({
              jsonrpc: '2.0',
              error: errorObj.data.originalError,
              id: parsed.id,
            })
          } else if (errorObj.data && errorObj.data.message) {
            pendingReq.resolve({
              jsonrpc: '2.0',
              error: errorObj.data,
              id: parsed.id,
            })
          } else {
            pendingReq.resolve({
              jsonrpc: '2.0',
              error: errorObj,
              id: parsed.id,
            })
          }
        } else {
          // No error; resolve with result
          pendingReq.resolve(parsed.result)
        }
      } else {
        // If there's no matching pending request, you can decide to ignore or handle differently
        console.log('No pending request matches id', requestId, parsed)
      }
    } else if (parsed?.type) {
      // Possibly a "notification" or event-based message
      // that doesn't match a pending JSON-RPC request
      eventEmitter.emit(parsed.type, parsed.payload)
    }
  })
}

// -------------------------
// The request forwarder
// -------------------------
export const handleRequest = async (
  jsonRpcPayload: RequestArguments,
  eventEmitter: EventEmitter
): Promise<any> => {
  if (!connectedWebSocket || connectedWebSocket.readyState !== WebSocket.OPEN) {
    throw new Error('No active WebSocket connection to forward request')
  }

  if (typeof jsonRpcPayload.id === 'undefined') {
    jsonRpcPayload = { ...jsonRpcPayload, id: Math.floor(Math.random() * 1e9).toString() }
  }

  const requestId = jsonRpcPayload.id

  return new Promise((resolve, reject) => {
    // Store references in our pendingRequests map
    pendingRequests[requestId] = { resolve, reject, method: jsonRpcPayload.method }

    // Optional: You can start a request-specific timeout here
    // to reject the request if it doesn't resolve in time.
    const timeout = setTimeout(() => {
      // If it times out, remove from pendingRequests.
      delete pendingRequests[requestId]
      console.error('Timeout waiting for WebSocket response', jsonRpcPayload)
      reject(new Error('Timeout waiting for WebSocket response'))
    }, 240000) // 4-min timeout or whatever you prefer

    connectedWebSocket.send(JSON.stringify(jsonRpcPayload), (err) => {
      if (err) {
        delete pendingRequests[requestId]
        clearTimeout(timeout)
        reject(err)
      } else {
        // If you want to log for specific methods:
        if (jsonRpcPayload.method === 'eth_sendTransaction' || jsonRpcPayload.method === 'eth_getTransactionReceipt' || jsonRpcPayload.method === 'eth_chainId') {
          console.log('Sent message to WebSocket client:', jsonRpcPayload)
        }
      }
    })
  })
}

export const startHostServer = async (eventEmitter: EventEmitter) => {
  let http_port = await findAvailablePort([49589])
  const websocket_port = await findAvailablePort([49588])

  // Create an Express server
  const startServer = () => {
    const server = express()
    const remixPath = path.join(__dirname, 'remix-ide')
    server.use(express.static(remixPath))
    console.log('remixPath', remixPath)
    server.get('/', (req, res) => {
      res.sendFile(path.join(remixPath, 'index.html'))
    })

    const httpServer = http.createServer(server)
    httpServer.listen(http_port, () => {
      const address = httpServer.address()
      if (typeof address === 'string') {
        console.log(`Server started at ${address}`)
      } else if (address && address.port) {
        console.log(`Server started at http://localhost:${address.port}`)
      }
    })

    return httpServer
  }

  // Create the WebSocket server
  const wsServer = new WebSocketServer({ port: websocket_port })
  wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected')

    // If we already have a connected client, close the new one
    if (connectedWebSocket && connectedWebSocket.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'error', payload: 'ALREADY_CONNECTED' }))
      ws.close(1000, 'Another client connected')
      return
    } else if (connectedWebSocket) {
      try {
        // Clean up any leftover listeners
        connectedWebSocket.removeAllListeners()
      } catch (_) {}
    }

    connectedWebSocket = ws
    eventEmitter.emit('connected', true)

    // Important: Use a single on('message') listener for all requests
    setupMessageHandler(ws, eventEmitter)

    connectedWebSocket.on('close', () => {
      console.log('WebSocket client disconnected')
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
      // Optionally clean up pendingRequests or handle them as errors
      // for (const requestId in pendingRequests) {
      //   pendingRequests[requestId].reject(new Error('WebSocket closed'))
      //   delete pendingRequests[requestId]
      // }
    })

    connectedWebSocket.on('error', (error) => {
      console.error('WebSocket error:', error)
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
    })
  })

  console.log(`WebSocket server running on ws://localhost:${(wsServer.address() as any).port}`)
  if ((process.env.NODE_ENV === 'production' || isPackaged) && !isE2ELocal) {
    startServer()
  } else {
    // For local dev, maybe keep using port 8080
    http_port = 8080
  }

  return {
    http_port,
    websocket_port,
  }
}

function parseWithBigInt(json: string) {
  // You can unify your approach here, either JSON.parse or try cbor first:
  try {
    // Attempt JSON parse with BigInt
    return JSON.parse(json, (key, value) => {
      if (typeof value === 'string' && /^\d+n?$/.test(value)) {
        return BigInt(value.endsWith('n') ? value.slice(0, -1) : value)
      }
      return value
    })
  } catch (jsonErr) {
    // fallback to cbor if you like:
    try {
      return cbor.decode(json)
    } catch (cborErr) {
      console.log('parseWithBigInt error', cborErr, json)
      return {}
    }
  }
}