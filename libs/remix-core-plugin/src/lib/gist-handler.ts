'use strict'
import { Plugin } from '@remixproject/engine'

interface StringByString {
  [key: string]: string;
}

const profile = {
  name: 'gistHandler',
  methods: ['load'],
  events: [],
  version: '0.0.1'
}

export class GistHandler extends Plugin {

  constructor () {
    super(profile)
  }

  async handleLoad (gistId: String | null, cb: Function) {
    if (!cb) cb = () => {}

    var loadingFromGist = false
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
              okFn: (value) => {
                setTimeout(() => resolve(value), 0)
              },
              cancelFn: () => {
                setTimeout(() => reject(), 0)
              }
            }
            this.call('modal', 'modal', modalContent)
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
            message: 'Error while loading gist. Please provide a valid Gist ID or URL.',
            modalType: 'alert'
          }
          this.call('modal', 'modal', modalContent)
        }
      } else {
        const modalContent = {
          id: 'gisthandlerEmpty',
          title: 'Gist load error',
          message: 'Error while loading gist. Id cannot be empty.',
          modalType: 'alert'
        }
        this.call('modal', 'modal', modalContent)
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

  load (gistId: String | null) {
    const self = this
    return self.handleLoad(gistId, async (gistId: String | null) => {
      let data: any
      try {
        data = await (await fetch(`https://api.github.com/gists/${gistId}`)).json() as any
        if (!data.files) {
          const modalContent = {
            id: 'gisthandler',
            title: 'Gist load error',
            message: data.message,
            modalType: 'alert'
          }
          await this.call('modal', 'modal', modalContent)
          return
        }
      } catch (e: any) {
        const modalContent = {
          id: 'gisthandler',
          title: 'Gist load error',
          message: e.message,
          modalType: 'alert'
        }
        await this.call('modal', 'modal', modalContent)
        return
      }

      const obj: StringByString = {}
      Object.keys(data.files).forEach((element) => {
        const path = element.replace(/\.\.\./g, '/')
        obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
      })
      this.call('fileManager', 'setBatchFiles', obj, 'workspace', true, async (errorSavingFiles: any) => {
        if (!errorSavingFiles) {
          const provider = await this.call('fileManager', 'getProviderByName', 'workspace')
        } else {
          const modalContent = {
            id: 'gisthandler',
            title: 'Gist load error',
            message: errorSavingFiles.message || errorSavingFiles,
            modalType: 'alert'
          }
          this.call('modal', 'modal', modalContent)
        }
      })


    })
  }
}

const getGistId = (str) => {
  var idr = /[0-9A-Fa-f]{8,}/
  var match = idr.exec(str)
  return match ? match[0] : null
}