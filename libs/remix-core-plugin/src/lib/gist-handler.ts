/* global fetch */
'use strict'
import { Plugin } from '@remixproject/engine'
import isElectron from 'is-electron'
import { Registry } from '@remix-project/remix-lib'

interface StringByString {
  [key: string]: string;
}

const profile = {
  name: 'gistHandler',
  methods: ['load'],
  events: [],
  version: '0.0.1'
}

type GistCallBackFn = (gistId: string) => void

export class GistHandler extends Plugin {
  isDesktop: boolean = false
  constructor() {
    super(profile)
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      this.isDesktop = true
    }
  }

  async handleLoad(gistId: string | null, cb: GistCallBackFn) {
    if (!cb) cb = () => { }

    let loadingFromGist = false
    if (!gistId) {
      loadingFromGist = true
      let value
      try {
        value = await (() => {
          return new Promise((resolve, reject) => {
            const modalContent = {
              id: 'gisthandler',
              title: 'Load a Gist',
              message: 'Enter the ID of the Gist or URL you would like to load.',
              modalType: 'prompt',
              okLabel: (this.isDesktop ? 'Load and select destination' : 'OK'),
              cancelLabel: 'Cancel',
              okFn: (value) => {
                setTimeout(() => resolve(value), 0)
              },
              cancelFn: () => {
                setTimeout(() => reject(new Error('Canceled')), 0)
              },
              hideFn: () => {
                setTimeout(() => reject(new Error('Hide')), 0)
              }
            }
            this.call('notification', 'modal', modalContent)
          })
        })()
      } catch (e) {
        // the modal has been canceled
        return
      }

      if (value !== '') {
        gistId = getGistId(value)
        if (gistId) {
          cb(gistId)
        } else {
          const modalContent = {
            id: 'gisthandler',
            title: 'Gist load error',
            message: 'Error while loading gist. Please provide a valid Gist ID or URL.'
          }
          this.call('notification', 'alert', modalContent)
        }
      } else {
        const modalContent = {
          id: 'gisthandlerEmpty',
          title: 'Gist load error',
          message: 'Error while loading gist. Id cannot be empty.'
        }
        this.call('notification', 'alert', modalContent)
      }
      return loadingFromGist
    } else {
      loadingFromGist = !!gistId
    }
    if (loadingFromGist) {
      cb(gistId)
    }
    return loadingFromGist
  }

  load(gistId: string | null) {
    const self = this
    return self.handleLoad(gistId, async (gistId: string | null) => {
      let data: any
      try {
        data = await (await fetch(`https://api.github.com/gists/${gistId}`)).json() as any
        if (!data.files) {
          const modalContent = {
            id: 'gisthandler',
            title: 'Gist load error',
            message: data.message,
            modalType: 'alert',
            okLabel: 'OK'
          }
          await this.call('notification', 'modal', modalContent)
          return
        }
      } catch (e: any) {
        const modalContent = {
          id: 'gisthandler',
          title: 'Gist load error',
          message: e.message

        }
        await this.call('notification', 'alert', modalContent)
        return
      }

      const gistIdWorkspace = 'gist ' + gistId
      const obj: StringByString = {}
      Object.keys(data.files).forEach((element) => {
        const path = element.replace(/\.\.\./g, '/')
        obj['/' + path] = data.files[element]
      })

      if (this.isDesktop) {
        await this.call('remix-templates', 'loadFilesInNewWindow', obj)
      } else {
        const workspaces = await this.call('filePanel', 'getWorkspaces')
        const found = workspaces.find((workspace) => workspace.name === gistIdWorkspace)
        if (found) {
          await this.call('notification', 'alert', {
            id: 'gistAlert',
            message: `workspace "${gistIdWorkspace}" already exists`,
          })
          return
        }
        await this.call('filePanel', 'createWorkspace', 'gist ' + gistId, '', true)
        await this.call('filePanel', 'switchToWorkspace', { name: 'gist ' + gistId, isLocalHost: false })
        this.call('fileManager', 'setBatchFiles', obj, isElectron() ? 'electron' : 'workspace', true, async (errorSavingFiles: any) => {
          if (errorSavingFiles) {
            const modalContent = {
              id: 'gisthandler',
              title: 'Gist load error',
              message: errorSavingFiles.message || errorSavingFiles

            }
            this.call('notification', 'alert', modalContent)
          }
        })
      }
    })
  }
}

const getGistId = (str) => {
  const idr = /[0-9A-Fa-f]{8,}/
  const match = idr.exec(str)
  return match ? match[0] : null
}
