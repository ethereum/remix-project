import isElectron from 'is-electron'
import { WebsocketPlugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'
var yo = require('yo-yo')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')

var csjs = require('csjs-inject')

var css = csjs`
  .dialog {
    display: flex;
    flex-direction: column;
  }
  .dialogParagraph {
    margin-bottom: 2em;
    word-break: break-word;
  }
`

const profile = {
  name: 'remixd',
  url: 'ws://127.0.0.1:65520',
  methods: ['folderIsReadOnly', 'resolveDirectory', 'get', 'exists', 'isFile', 'set', 'rename', 'remove', 'isDirectory', 'list'],
  events: [],
  description: 'Using Remixd daemon, allow to access file system',
  kind: 'other',
  version: packageJson.version
}

export class RemixdHandle extends WebsocketPlugin {
  constructor (fileSystemExplorer, locahostProvider, appManager) {
    super(profile)
    this.fileSystemExplorer = fileSystemExplorer
    this.locahostProvider = locahostProvider
    this.appManager = appManager
  }

  deactivate () {
    if (super.socket) super.deactivate()
    this.locahostProvider.close((error) => {
      if (error) console.log(error)
    })
  }

  activate () {
    this.connectToLocalhost()
  }

  async canceled () {
    this.appManager.ensureDeactivated('remixd')
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash    - hash of the transaction
    */
  async connectToLocalhost () {
    let connection = (error) => {
      if (error) {
        console.log(error)
        modalDialogCustom.alert(
          'Cannot connect to the remixd daemon.' +
          'Please make sure you have the remixd running in the background.'
        )
        this.canceled()
      } else {
        this.locahostProvider.init()
        this.fileSystemExplorer.ensureRoot()
      }
    }
    if (this.locahostProvider.isConnected()) {
      this.deactivate()
    } else if (!isElectron()) {
      // warn the user only if he/she is in the browser context
      modalDialog(
        'Connect to localhost',
        remixdDialog(),
        { label: 'Connect',
          fn: () => {
            try {
              super.activate()
              setTimeout(() => { connection() }, 2000)
            } catch (error) {
              connection(error)
            }
          }
        },
        { label: 'Cancel',
          fn: () => {
            this.canceled()
          }
        }
      )
    } else {
      try {
        super.activate()
        setTimeout(() => { connection() }, 2000)
      } catch (error) {
        connection(error)
      }
    }
  }
}

function remixdDialog () {
  return yo`
    <div class=${css.dialog}>
      <div class=${css.dialogParagraph}>Interact with your file system from Remix. Click connect and find shared folder in the Remix file explorer (under localhost).
        Before you get started, check out the <a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html">Remixd tutorial</a>.
        to find out how to run Remixd.
      </div>
      <div class=${css.dialogParagraph}>If you have looked at that tutorial and are just looking for the remixd command, <br> here it is:
        <br><b>remixd -s absolute-path-to-the-shared-folder --remix-ide your-remix-ide-URL-instance</b>
      </div>
      <div class=${css.dialogParagraph}>Connection will start a session between <em>${window.location.href}</em> and your local file system <i>ws://127.0.0.1:65520</i>
        so please make sure your system is secured enough (port 65520 neither opened nor forwarded).
        <i class="fas fa-link"></i> will show you current connection status.
      </div>
      <div class=${css.dialogParagraph}>This feature is still in Alpha, so we recommend you to keep a copy of the shared folder.</div>
    </div>
  `
}
