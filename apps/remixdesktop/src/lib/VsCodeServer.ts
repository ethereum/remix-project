import { WebSocketServer, WebSocket } from 'ws'
import EventEmitter from 'events'

import { findAvailablePort } from '../utils/portFinder'

// Forwarding WebSocket client
let connectedWebSocket: WebSocket = null

export const VSCodeEvents = {
  CONNECTED: 'connected',
  OPEN_WORKSPACE: 'openWorkspace',
  WORKSPACE_AND_OPENED_FILES: 'workspaceAndOpenedFiles',
} as const

// Base message type
export interface VsCodeMessageBase {
  type: string
}

// Specific message types
export interface OpenWorkspaceMessage extends VsCodeMessageBase {
  type: 'openWorkspace'
  payload: {
    workspaceFolders: string[]
  }
}

export interface WorkspaceAndOpenedFilesMessage extends VsCodeMessageBase {
  type: 'workspaceAndOpenedFiles'
  payload: {
    openedFiles: string[]
    workspaceFolders: string[]
    focusedFile: string | null
  }
}

// Create a discriminated union for VsCodeMessage
export type VsCodeMessage = OpenWorkspaceMessage | WorkspaceAndOpenedFilesMessage

export const startVsCodeServer = async (eventEmitter: EventEmitter) => {
  const websocket_port = await findAvailablePort([49600])

  // Create the WebSocket server
  const wsServer = new WebSocketServer({ port: websocket_port })

  wsServer.on('connection', (ws) => {
    console.log('VSCODE client connected')
    if (connectedWebSocket?.OPEN) {
      ws.close(1000, 'Another client connected')
      return
    } else {
      try {
        connectedWebSocket?.removeAllListeners()
      } catch (e) {}
    }

    connectedWebSocket = ws
    eventEmitter.emit('connected', true)

    connectedWebSocket.on('message', (data: any) => {
      if (Buffer.isBuffer(data)) {
        data = data.toString('utf-8')
      }
      try {
        data = JSON.parse(data)
      } catch (e) {
        //
      }
      const message: VsCodeMessage = data
      console.log('VSCODE message:', message)
      if (message.type === 'openWorkspace') {
        eventEmitter.emit(VSCodeEvents.OPEN_WORKSPACE, message)
      } else if (message.type === 'workspaceAndOpenedFiles') {
        eventEmitter.emit(VSCodeEvents.WORKSPACE_AND_OPENED_FILES, message)
      }
    })

    connectedWebSocket.on('close', () => {
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
    })

    connectedWebSocket.on('error', (error) => {
      connectedWebSocket = null
      eventEmitter.emit('connected', false)
    })
  })

  console.log(`VSCODE server running on ws://localhost:${(wsServer.address() as any).port}`)
}

/**
 * Sends a message to the connected VSCode WebSocket client.
 * @param message - The message to send.
 * @throws Will throw an error if no client is connected.
 */
export const logToVsCode = (message: { type: 'error' | 'log' | 'info' | 'warning'; message: string }) => {
  if (!connectedWebSocket || connectedWebSocket.readyState !== WebSocket.OPEN) {
    throw new Error('No VSCode client connected or WebSocket is not open')
  }

  try {
    connectedWebSocket.send(JSON.stringify(message))
    console.log('Message sent to VSCODE:', message)
  } catch (error) {
    console.error('Failed to send message to VSCODE:', error)
  }
}


