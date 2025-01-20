import { WebSocketServer, WebSocket } from 'ws'
import EventEmitter from 'events'

import { findAvailablePort } from '../utils/portFinder'

// Forwarding WebSocket client
let connectedWebSocket: WebSocket | null = null

export const VSCodeEvents = {
  CONNECTED: 'connected',
  OPEN_WORKSPACE: 'openWorkspace',
  WORKSPACE_AND_OPENED_FILES: 'workspaceAndOpenedFiles',
} as const;

// Base message type
export interface VsCodeMessageBase {
  type: string;
}

// Specific message types
export interface OpenWorkspaceMessage extends VsCodeMessageBase {
  type: 'openWorkspace';
  payload: {
    workspaceFolders: string[];
  };
}


export interface WorkspaceAndOpenedFilesMessage extends VsCodeMessageBase {
  type: 'workspaceAndOpenedFiles';
  payload: {
    openedFiles: string[];
    workspaceFolders: string[];
    focusedFile: string | null;
  };
}
// Create a discriminated union for VsCodeMessage
export type VsCodeMessage = OpenWorkspaceMessage | WorkspaceAndOpenedFilesMessage;


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
      if(message.type === 'openWorkspace') {
        eventEmitter.emit(VSCodeEvents.OPEN_WORKSPACE, message)
      } else if(message.type === 'workspaceAndOpenedFiles') {
        eventEmitter.emit(VSCodeEvents.WORKSPACE_AND_OPENED_FILES, message)
      }
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

  console.log(`VSCODE server running on ws://localhost:` + JSON.stringify((wsServer.address() as any).port))
}
