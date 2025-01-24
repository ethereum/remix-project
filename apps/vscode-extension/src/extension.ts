// Import the required modules
import * as vscode from "vscode";
import WebSocket from "ws";

let ws: WebSocket | null = null;
let statusBar: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// Define the base type
interface VsCodeMessageBase {
  type: string;
}

// Define specific types for each message type
interface OpenWorkspaceMessage extends VsCodeMessageBase {
  type: "openWorkspace";
  payload: {
    workspaceFolders: string[];
  };
}

interface WorkspaceAndOpenedFilesMessage extends VsCodeMessageBase {
  type: "workspaceAndOpenedFiles";
  payload: {
    openedFiles: string[];
    workspaceFolders: string[];
    focusedFile: string | null;
  };
}

// Create a discriminated union for VsCodeMessage
type VsCodeMessage = OpenWorkspaceMessage | WorkspaceAndOpenedFilesMessage;

// Activate the extension
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("WebSocket remixsync activated!");
  // Create status bar item
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = "$(plug) Disconnected";
  statusBar.tooltip = "Click to toggle WebSocket connection";
  statusBar.command = "remixsync.toggleWebSocket";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Create an output channel for logs
  outputChannel = vscode.window.createOutputChannel("RemixSync Logs");
  outputChannel.show(); // Optionally show the channel when the extension activates

  // Command to toggle WebSocket connection
  const toggleWebSocketCommand = vscode.commands.registerCommand(
    "remixsync.toggleWebSocket",
    () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        disconnectWebSocket();
      } else {
        connectWebSocket();
      }
    }
  );
  context.subscriptions.push(toggleWebSocketCommand);

  // Command to open workspace in Remix Desktop
  const openWorkspaceCommand = vscode.commands.registerCommand(
    "remixsync.openWorkspace",
    () => {
      sendOpenWorkspaceCommand();
    }
  );
  context.subscriptions.push(openWorkspaceCommand);

  // Connect to WebSocket
  function connectWebSocket() {
    ws = new WebSocket("ws://localhost:49600"); // Replace with your WebSocket server URL

    ws.on("open", () => {
      vscode.window.showInformationMessage("WebSocket connected!");
      updateStatusBar(true);
      sendWorkspaceAndOpenedFiles();
    });

    ws.on("message", (rawData) => {
      let parsedMessage: any;
  
      // Try parsing the raw data as JSON
      try {
          parsedMessage = JSON.parse(rawData.toString());
      } catch (error) {
          // If JSON parsing fails, log the raw data as an error
          logToOutput(`Failed to parse message: ${rawData}`, "error");
          return;
      }
  
      // Handle parsed message
      if (typeof parsedMessage === "string") {
          // If the message is a plain string, log it as info
          logToOutput(parsedMessage, "info");
      } else if (typeof parsedMessage === "object" && parsedMessage.type) {
          // Handle messages with a type field
          switch (parsedMessage.type) {
              case "info":
                  logToOutput(parsedMessage.message || "No message provided", "info");
                  break;
              case "warning":
                  logToOutput(parsedMessage.message || "No message provided", "warning");
                  break;
              case "error":
                  logToOutput(parsedMessage.message || "No message provided", "error");
                  break;
              default:
                  logToOutput(`Unknown message type: ${parsedMessage.type}`, "warning");
          }
      } else {
          // Log unexpected message format
          logToOutput(`Unexpected message format: ${JSON.stringify(parsedMessage)}`, "warning");
      }
  });
  

    ws.on("error", (error) => {
      vscode.window.showErrorMessage(`WebSocket error: ${error.message}`);
    });

    ws.on("close", () => {
      vscode.window.showWarningMessage("WebSocket connection closed.");
      updateStatusBar(false);
    });
  }

  // Disconnect from WebSocket
  function disconnectWebSocket() {
    if (ws) {
      ws.close();
      ws = null;
      updateStatusBar(false);
    }
  }

  // Update the status bar icon
  function updateStatusBar(isConnected: boolean) {
    if (isConnected) {
      statusBar.text = "$(zap) Connected";
    } else {
      statusBar.text = "$(plug) Disconnected";
    }
    logToOutput(
      `WebSocket connection status: ${
        isConnected ? "Connected" : "Disconnected"
      }`
    );
  }

  function logToOutput(
    message: string,
    type: "info" | "warning" | "error" = "info"
  ) {
    const timestamp = new Date().toISOString();
    let formattedMessage: string;

    switch (type) {
      case "info":
        formattedMessage = `[INFO ${timestamp}] ${message}`;
        break;
      case "warning":
        formattedMessage = `[WARNING ${timestamp}] ${message}`;
        break;
      case "error":
        formattedMessage = `[ERROR ${timestamp}] ${message}`;
        break;
    }

    outputChannel.appendLine(formattedMessage);
  }

  // Function to send the openWorkspace command to the WebSocket server
  function sendOpenWorkspaceCommand() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const workspaceFolders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
        [];
      const message: OpenWorkspaceMessage = {
        type: "openWorkspace",
        payload: {
          workspaceFolders,
        },
      };
      const data = JSON.stringify(message);

      ws.send(data);
      vscode.window.showInformationMessage(
        "Open workspace command sent to Remix Desktop."
      );
    } else {
      vscode.window.showWarningMessage(
        "WebSocket is not connected. Unable to send openWorkspace command."
      );
    }
  }

  // Function to send the currently opened files and workspace directory to the WebSocket server
  async function sendWorkspaceAndOpenedFiles() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const openedFiles = vscode.workspace.textDocuments.map(
        (doc) => doc.uri.fsPath
      );
      const workspaceFolders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
        [];
      const focusedFile =
        vscode.window.activeTextEditor?.document.uri.fsPath || null;

      const message: VsCodeMessage = {
        type: "workspaceAndOpenedFiles",
        payload: {
          openedFiles,
          workspaceFolders,
          focusedFile,
        },
      };
      ws.send(JSON.stringify(message));
    }
  }

  // Listen for active editor changes
  vscode.window.onDidChangeActiveTextEditor(
    () => {
      sendWorkspaceAndOpenedFiles();
    },
    null,
    context.subscriptions
  );

  // Listen for document changes
  vscode.workspace.onDidChangeTextDocument(
    () => {
      sendWorkspaceAndOpenedFiles();
    },
    null,
    context.subscriptions
  );

  // Listen for workspace folder changes
  vscode.workspace.onDidChangeWorkspaceFolders(
    () => {
      sendWorkspaceAndOpenedFiles();
    },
    null,
    context.subscriptions
  );

  // Clean up when the extension is deactivated
  context.subscriptions.push({
    dispose: () => {
      if (ws) {
        ws.close();
      }
    },
  });
}

// Deactivate the extension
export function deactivate() {
  if (ws) {
    ws.close();
  }
}
