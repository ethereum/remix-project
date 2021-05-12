import isElectron from 'is-electron'
import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
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
  displayName: 'RemixD',
  url: 'ws://127.0.0.1:65520',
  methods: ['folderIsReadOnly', 'resolveDirectory', 'get', 'exists', 'isFile', 'set', 'rename', 'remove', 'isDirectory', 'list', 'createDir'],
  events: [],
  description: 'Using Remixd daemon, allow to access file system',
  kind: 'other',
  version: packageJson.version
}

export class RemixdHandle extends WebsocketPlugin {
  constructor (locahostProvider, appManager) {
    super(profile)
    this.locahostProvider = locahostProvider
    this.appManager = appManager
  }

  deactivate () {
    if (super.socket) super.deactivate()
    // this.appManager.deactivatePlugin('git') // plugin call doesn't work.. see issue https://github.com/ethereum/remix-plugin/issues/342
    this.locahostProvider.close((error) => {
      if (error) console.log(error)
    })
  }

  activate () {
    this.connectToLocalhost()
  }

  async canceled () {
    // await this.appManager.deactivatePlugin('git') // plugin call doesn't work.. see issue https://github.com/ethereum/remix-plugin/issues/342
    await this.appManager.deactivatePlugin('remixd')
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash - hash of the transaction
    */
  async connectToLocalhost () {
    const connection = (error) => {
      if (error) {
        console.log(error)
        modalDialogCustom.alert(
          'Cannot connect to the remixd daemon. ' +
          'Please make sure you have the remixd running in the background.'
        )
        this.canceled()
      } else {
        const intervalId = setInterval(() => {
          if (!this.socket || (this.socket && this.socket.readyState === 3)) { // 3 means connection closed
            clearInterval(intervalId)
            console.log(error)
            modalDialogCustom.alert(
              'Connection to remixd terminated. ' +
              'Please make sure remixd is still running in the background.'
            )
            this.canceled()
          }
        }, 3000)
        this.locahostProvider.init(() => {})
        // this.call('manager', 'activatePlugin', 'git')
      }
    }
    if (this.locahostProvider.isConnected()) {
      this.deactivate()
    } else if (!isElectron()) {
      // warn the user only if he/she is in the browser context
      modalDialog(
        'Connect to localhost',
        remixdDialog(),
        {
          label: 'Connect',
          fn: () => {
            try {
              this.locahostProvider.preInit()
              super.activate()
              setTimeout(() => {
                if (!this.socket || (this.socket && this.socket.readyState === 3)) { // 3 means connection closed
                  connection(new Error('Connection with daemon failed.'))
                } else {
                  connection()
                }
              }, 3000)
            } catch (error) {
              connection(error)
            }
          }
        },
        {
          label: 'Cancel',
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
      <div class=${css.dialogParagraph}>Interact with your file system from Remix. <br>See the <a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html">Remixd tutorial</a> for more info.
      </div>
      <div class=${css.dialogParagraph}>If you have looked at the Remixd docs and just need remixd command, <br> here it is:
        <br><b>remixd -s absolute-path-to-the-shared-folder --remix-ide your-remix-ide-URL-instance</b>
      </div>
      <div class=${css.dialogParagraph}>Connection will start a session between <em>${window.location.origin}</em> and your local file system <i>ws://127.0.0.1:65520</i>
        so please make sure your system is secured enough (port 65520 neither opened nor forwarded).
      </div>
      <div class=${css.dialogParagraph}>
        <h6 class="text-danger">
          Before using, make sure you have the <b>latest remixd version</b>.<br><a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html#update-to-the-latest-remixd">Read here how to update it</a>
        </h6>
      </div>
      <div class=${css.dialogParagraph}>This feature is still in Alpha, so we recommend you to keep a copy of the shared folder.</div>
    </div>
  `
}
