var yo = require('yo-yo')
var modalDialog = require('../ui/modaldialog')

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

export class RemixdHandle {
  constructor (fileSystemExplorer, locahostProvider) {
    this.fileSystemExplorer = fileSystemExplorer
    this.locahostProvider = locahostProvider
  }

  profile () {
    return {
      name: 'remixd',
      methods: [],
      events: [],
      description: 'using Remixd daemon, allow to access file system',
      kind: 'other'
    }
  }

  deactivate () {
    this.locahostProvider.close((error) => {
      if (error) console.log(error)
    })
  }

  activate () {
    this.connectToLocalhost()
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash    - hash of the transaction
    */
  connectToLocalhost () {
    if (this.locahostProvider.isConnected()) {
      this.locahostProvider.close((error) => {
        if (error) console.log(error)
      })
    } else {
      modalDialog('Connect to localhost', remixdDialog(),
        { label: 'Connect',
          fn: () => {
            this.locahostProvider.init((error) => {
              if (error) {
                console.log(error)
              } else {
                this.fileSystemExplorer.ensureRoot()
              }
            })
          }}
      )
    }
  }
}

function remixdDialog () {
  return yo`
    <div class=${css.dialog}>
      <div class=${css.dialogParagraph}>Interact with your file system from Remix. Click connect and find shared folder in the Remix file explorer (under localhost).
        Before you get started, check out <a target="_blank" href="https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html">Tutorial_remixd_filesystem</a>
        to find out how to run Remixd.
      </div>
      <div class=${css.dialogParagraph}>Connection will start a session between <em>${window.location.href}</em> and your local file system <i>ws://127.0.0.1:65520</i>
        so please make sure your system is secured enough (port 65520 neither opened nor forwarded).
        <i class="fa fa-link"></i> will show you current connection status.
      </div>
      <div class=${css.dialogParagraph}>This feature is still in Alpha, so we recommend you to keep a copy of the shared folder.</div>
    </div>
  `
}
