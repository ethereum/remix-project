const remixd = require('remixd')

const { app, BrowserWindow } = require('electron')
const { AppManager, registerPackageProtocol } = require('@philipplgh/electron-app-manager')
registerPackageProtocol(__dirname + '/cache')


const updater = new AppManager({
  repository: 'https://github.com/yann300/remix-desktop',
  auto: true,
  electron: true
})

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

var folder = process.argv.length > 2 ? process.argv[2] : process.cwd()

var router = new remixd.Router(65520, remixd.services.sharedFolder, { remixIdeUrl: 'package://cd339faeeb58f4c96b9b5ff62556c364.mod' }, (webSocket) => {
  remixd.services.sharedFolder.setWebSocket(webSocket)
  remixd.services.sharedFolder.setupNotifications(folder)
  remixd.services.sharedFolder.sharedFolder(folder, false)
})

router.start()
