import isElectron from 'is-electron'
import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import { version as remixdVersion} from '../../../../../libs/remixd/package.json'
var yo = require('yo-yo')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var copyToClipboard = require('../ui/copy-to-clipboard')

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
  constructor (localhostProvider, appManager) {
    super(profile)
    this.localhostProvider = localhostProvider
    this.appManager = appManager
  }

  deactivate () {
    if (super.socket) super.deactivate()
    // this.appManager.deactivatePlugin('git') // plugin call doesn't work.. see issue https://github.com/ethereum/remix-plugin/issues/342
    if (this.appManager.actives.includes('hardhat')) this.appManager.deactivatePlugin('hardhat')
    this.localhostProvider.close((error) => {
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
        this.localhostProvider.init(() => {})
        this.call('manager', 'activatePlugin', 'hardhat')
      }
    }
    if (this.localhostProvider.isConnected()) {
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
              this.localhostProvider.preInit()
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
  const commandText = 'remixd -s path-to-the-shared-folder --remix-ide remix-ide-instance-URL'
  return yo`
    <div class=${css.dialog}>
      <div class=${css.dialogParagraph}>
        Access your local file system from Remix IDE using <a target="_blank" href="https://www.npmjs.com/package/@remix-project/remixd">Remixd NPM package</a>.<br/><br/> 
        Remixd needs to be running in the background to load the files in localhost workspace. For more info, please check the <a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html">Remixd tutorial</a>.
      </div>
      <div class=${css.dialogParagraph}>If you are just looking for the remixd command, here it is:
        <br><br><b>${commandText}</b>
        <span class="">${copyToClipboard(() => commandText)}</span>
      </div>
      <div class=${css.dialogParagraph}>On successful connection, a session will be started between <em>${window.location.origin}</em> and your local file system at <i>ws://127.0.0.1:65520</i>
         and files will be loaded under localhost workspace in the File Explorers. 
        <br/>Please note, if shared folder is a hardhat project, an additional hardhat websocket plugin will be listening at <i>ws://127.0.0.1:65522</i>
      </div>
      <div class=${css.dialogParagraph}>Please make sure your system is secured enough and ports 65520, 65522 are not opened nor forwarded.
        This feature is still in Alpha, so we recommend to keep a copy of the shared folder.
      </div>
      <div class=${css.dialogParagraph}>
        <h6 class="text-danger">
          Before using, make sure remixd version is latest i.e. <b>${remixdVersion}</b>
          <br><a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html#update-to-the-latest-remixd">Read here how to update it</a>
        </h6>
      </div>
    </div>
  `
}
