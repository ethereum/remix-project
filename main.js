const remixd = require('remixd')
const path = require('path')
const os = require('os')

const { version } = require('./package.json')
const applicationMenu = require('./applicationMenu')
const { app, BrowserWindow, shell } = require('electron')
const { AppManager, registerPackageProtocol } = require('@philipplgh/electron-app-manager')

const cacheDir = path.join(os.homedir(), '.cache_remix_ide')
registerPackageProtocol(cacheDir)

console.log('running', version)
const updater = new AppManager({
  repository: 'https://github.com/ethereum/remix-desktop',
  auto: true,
  electron: true
})

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'build/icon.png')
  })
  applicationMenu(remixd)
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  })
  win.loadURL('package://github.com/ethereum/remix-ide')
}

app.on('ready', () => {
  remixdStart()
  createWindow()  
})

let remixdStart = () => {
  const remixIdeUrl = 'package://a7df6d3c223593f3550b35e90d7b0b1f.mod'
  console.log('start shared folder service')
  let router = new remixd.Router(65520, remixd.services.sharedFolder, { remixIdeUrl }, (webSocket) => {
    console.log('set websocket')
    remixd.services.sharedFolder.setWebSocket(webSocket)
  })
  router.start()
}
