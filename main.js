const remixd = require('remixd')
const os = require('os');

const { version } = require('./package.json')
const selectFolder = require('./selectFolder')
const { app, BrowserWindow } = require('electron')
const { AppManager, registerPackageProtocol } = require('@philipplgh/electron-app-manager')
registerPackageProtocol()

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
    }
  })
  win.loadURL('package://github.com/ethereum/remix-ide')
}

app.on('ready', () => {
  remixdStart()
  createWindow()

  if (process.argv.length > 2) {
    remixdInit(process.argv[2])
  } else {
    selectFolder().then((folder) => {
      console.log('set folder', folder)
      remixdInit(folder)
    }).catch((error) => {
      console.log(error, 'defaulting to home directory')
      remixdInit(os.homedir())
    })
  }
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

let remixdInit = (folder) => {
  remixd.services.sharedFolder.sharedFolder(folder, false)
  remixd.services.sharedFolder.setupNotifications(folder)
}
