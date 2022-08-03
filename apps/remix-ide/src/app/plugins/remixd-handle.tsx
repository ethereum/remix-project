/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from 'react' // eslint-disable-line
import isElectron from 'is-electron'
import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import { version as remixdVersion } from '../../../../../libs/remixd/package.json'
import { PluginManager } from '@remixproject/engine'
import { AppModal, AlertModal } from '@remix-ui/app'
import { CopyToClipboard } from '@remix-ui/clipboard'

const LOCALHOST = ' - connect to localhost - '

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

enum State {
  ok,
  cancel,
  new
}

export class RemixdHandle extends WebsocketPlugin {
  localhostProvider: any
  appManager: PluginManager
  constructor (localhostProvider, appManager) {
    super(profile)
    this.localhostProvider = localhostProvider
    this.appManager = appManager
  }

  async deactivate () {
    if (super.socket) super.deactivate()
    // this.appManager.deactivatePlugin('git') // plugin call doesn't work.. see issue https://github.com/ethereum/remix-plugin/issues/342
    if (this.appManager.isActive('hardhat')) this.appManager.deactivatePlugin('hardhat')
    if (this.appManager.isActive('truffle')) this.appManager.deactivatePlugin('truffle')
    if (this.appManager.isActive('slither')) this.appManager.deactivatePlugin('slither')
    this.localhostProvider.close((error) => {
      if (error) console.log(error)
    })
  }

  async activate () {
    this.connectToLocalhost()
    return true
  }

  async canceled () {
    await this.appManager.deactivatePlugin('remixd')
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash - hash of the transaction
    */
  async connectToLocalhost () {
    const connection = (error?:any) => {
      if (error) {
        console.log(error)
        const alert:AlertModal = {
          id: 'connectionAlert',
          message: 'Cannot connect to the remixd daemon. Please make sure you have the remixd running in the background.'
        }
        this.call('notification', 'alert', alert)
        this.canceled()
      } else {
        const intervalId = setInterval(() => {
          if (!this.socket || (this.socket && this.socket.readyState === 3)) { // 3 means connection closed
            clearInterval(intervalId)
            const alert:AlertModal = {
              id: 'connectionAlert',
              message: 'Connection to remixd terminated. Please make sure remixd is still running in the background.'
            }
            this.call('notification', 'alert', alert)
            this.canceled()
          }
        }, 3000)
        this.localhostProvider.init(() => {
          this.call('filePanel', 'setWorkspace', { name: LOCALHOST, isLocalhost: true }, true)
        })
        this.call('manager', 'activatePlugin', 'hardhat')
        this.call('manager', 'activatePlugin', 'truffle')
        this.call('manager', 'activatePlugin', 'slither')
      }
    }
    if (this.localhostProvider.isConnected()) {
      this.deactivate()
    } else if (!isElectron()) {
      // warn the user only if he/she is in the browser context
      const mod:AppModal = {
        id: 'remixdConnect',
        title: 'Connect to localhost',
        message: remixdDialog(),
        okLabel: 'Connect',
        cancelLabel: 'Cancel',
      }
      const result =  await this.call('notification', 'modal', mod)
      if(result) {
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
      else {
        await this.canceled()
      }
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
  const commandText = 'remixd'
  const fullCommandText = 'remixd -s <path-to-the-shared-folder> -u <remix-ide-instance-URL>'
  return (<>
    <div className=''>
      <div className='mb-2 text-break'>
        Access your local file system from Remix IDE using <a target="_blank" href="https://www.npmjs.com/package/@remix-project/remixd">Remixd NPM package</a>.
      </div>
      <div className='mb-2 text-break'>
        Remixd <a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html">documentation</a>.
      </div>
      <div className='mb-2 text-break'>
        The remixd command is:
        <br/><b>{commandText}</b>
      </div>
      <div className='mb-2 text-break'>
        The remixd command without options uses the terminal's current directory as the shared directory and the shared Remix domain can only be https://remix.ethereum.org, https://remix-alpha.ethereum.org, or https://remix-beta.ethereum.org
      </div>
      <div className='mb-2 text-break'>
        Example command with flags: <br/>
        <b>{fullCommandText}</b>
      </div>
      <div className='mb-2 text-break'>
        For info about ports, see <a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html#ports-usage">Remixd ports usage</a>
      </div>
      <div className='mb-2 text-break'>
        This feature is still in Alpha. We recommend to keep a backup of the shared folder.
      </div>
      <div className='mb-2 text-break'>
        <h6 className="text-danger">
          Before using, make sure remixd version is latest i.e. <b>v{remixdVersion}</b>
          <br></br><a target="_blank" href="https://remix-ide.readthedocs.io/en/latest/remixd.html#update-to-the-latest-remixd">Read here how to update it</a>
        </h6>
      </div>
    </div>
  </>)
}
