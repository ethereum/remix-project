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

// Forwarding WebSocket client
let connectedWebSocket: WebSocket | null = null

export const startVsCodeServer = async (eventEmitter: EventEmitter) => {
  const websocket_port = await findAvailablePort([49600])

  // Create the WebSocket server
  const wsServer = new WebSocketServer({ port: websocket_port })

  wsServer.on('connection', (ws) => {
    console.log('VSCODE client connected')
    if (connectedWebSocket?.OPEN) {
      //ws.send(JSON.stringify({ type: 'error', payload: 'ALREADY_CONNECTED' }))
      ws.close(1000, 'Another client connected')
      return
      //console.log(connectedWebSocket.url)
    } else {
      try {
        connectedWebSocket.removeAllListeners()
      } catch (e) {}
    }

    connectedWebSocket = ws
    eventEmitter.emit('connected', true)

    connectedWebSocket.on('message', (data: any) => {
        if(Buffer.isBuffer(data)) {
            data = data.toString('utf-8');
        }
      console.log('received message from VSCODE WebSocket client:', data)
    })

    connectedWebSocket.on('close', () => {
      //console.log('WebSocket client disconnected');
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
    })

    connectedWebSocket.on('error', (error) => {
      //console.error('WebSocket error:', error.message);
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
    })
  })

  console.log(`WebSocket server running on ws://localhost:` + JSON.stringify((wsServer.address() as any).port))
}
