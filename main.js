const { app, BrowserWindow } = require('electron')
const { registerPackageProtocol } = require('@philipplgh/electron-app-manager')
registerPackageProtocol(__dirname + '/cache')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  })

  // and load the index.html of the app.
  // win.loadFile('index.html')
  win.loadURL('package://github.com/ethereum/remix-ide')
}

app.on('ready', createWindow)
