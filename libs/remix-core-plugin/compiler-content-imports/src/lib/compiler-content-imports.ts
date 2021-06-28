'use strict'
import { Plugin } from '@remixproject/engine'
import { RemixURLResolver } from '@remix-project/remix-url-resolver'
const remixTests = require('@remix-project/remix-tests')
const async = require('async')

const profile = {
  name: 'contentImport',
  displayName: 'content import',
  version: '0.0.1',
  methods: ['resolve', 'resolveAndSave', 'isExternalUrl']
}

export class CompilerImports extends Plugin {
  previouslyHandled: {}
  fileManager: any
  urlResolver: any
  constructor (fileManager) {
    super(profile)
    this.fileManager = fileManager
    this.urlResolver = new RemixURLResolver()
    this.previouslyHandled = {} // cache import so we don't make the request at each compilation.
  }

  async setToken () {
    const protocol = typeof window !== 'undefined' && window.location.protocol
    const token = await this.call('settings', 'getGithubAccessToken')
    this.urlResolver.setGistToken(token, protocol)
  }

  isRelativeImport (url) {
    return /^([^/]+)/.exec(url)
  }

  isExternalUrl (url) {
    const handlers = this.urlResolver.getHandlers()
    return handlers.some(handler => handler.match(url))
  }

  /**
    * resolve the content of @arg url. This only resolves external URLs.
    *
    * @param {String} url  - external URL of the content. can be basically anything like raw HTTP, ipfs URL, github address etc...
    * @returns {Promise} - { content, cleanUrl, type, url }
    */
  resolve (url) {
    return new Promise((resolve, reject) => {
      this.import(url, null, (error, content, cleanUrl, type, url) => {
        if (error) return reject(error)
        resolve({ content, cleanUrl, type, url })
      }, null)
    })
  }

  async import (url, force, loadingCb, cb) {
    if (typeof force !== 'boolean') {
      const temp = loadingCb
      loadingCb = force
      cb = temp
      force = false
    }
    if (!loadingCb) loadingCb = () => {}
    if (!cb) cb = () => {}

    var self = this
    if (force) delete this.previouslyHandled[url]
    var imported = this.previouslyHandled[url]
    if (imported) {
      return cb(null, imported.content, imported.cleanUrl, imported.type, url)
    }

    let resolved
    try {
      await this.setToken()
      resolved = await this.urlResolver.resolve(url)
      const { content, cleanUrl, type } = resolved
      self.previouslyHandled[url] = {
        content,
        cleanUrl,
        type
      }
      cb(null, content, cleanUrl, type, url)
    } catch (e) {
      return cb(new Error('not found ' + url))
    }
  }

  importExternal (url, targetPath, cb) {
    this.import(url,
      // TODO: handle this event
      (loadingMsg) => { this.emit('message', loadingMsg) },
      (error, content, cleanUrl, type, url) => {
        if (error) return cb(error)
        if (this.fileManager) {
          const provider = this.fileManager.currentFileProvider()
          const path = targetPath || type + '/' + cleanUrl
          if (provider) provider.addExternal('.deps/' + path, content, url)
        }
        cb(null, content)
      }, null)
  }

  /**
    * import the content of @arg url.
    * first look in the browser localstorage (browser explorer) or locahost explorer. if the url start with `browser/*` or  `localhost/*`
    * then check if the @arg url is located in the localhost, in the node_modules or installed_contracts folder
    * then check if the @arg url match any external url
    *
    * @param {String} url - URL of the content. can be basically anything like file located in the browser explorer, in the localhost explorer, raw HTTP, github address etc...
    * @param {String} targetPath - (optional) internal path where the content should be saved to
    * @returns {Promise} - string content
    */
  resolveAndSave (url, targetPath) {
    return new Promise((resolve, reject) => {
      if (url.indexOf('remix_tests.sol') !== -1) resolve(remixTests.assertLibCode)
      if (!this.fileManager) {
        // fallback to just resolving the file, it won't be saved in file manager
        return this.importExternal(url, targetPath, (error, content) => {
          if (error) return reject(error)
          resolve(content)
        })
      }
      var provider = this.fileManager.fileProviderOf(url)
      if (provider) {
        if (provider.type === 'localhost' && !provider.isConnected()) {
          return reject(new Error(`file provider ${provider.type} not available while trying to resolve ${url}`))
        }
        provider.exists(url).then(exist => {
          /*
            if the path is absolute and the file does not exist, we can stop here
            Doesn't make sense to try to resolve "localhost/node_modules/localhost/node_modules/<path>" and we'll end in an infinite loop.
          */
          if (!exist && url.startsWith('browser/')) return reject(new Error(`not found ${url}`))
          if (!exist && url.startsWith('localhost/')) return reject(new Error(`not found ${url}`))

          if (exist) {
            return provider.get(url, (error, content) => {
              if (error) return reject(error)
              resolve(content)
            })
          }

          // try to resolve localhost modules (aka truffle imports) - e.g from the node_modules folder
          const localhostProvider = this.fileManager.getProvider('localhost')
          if (localhostProvider.isConnected()) {
            var splitted = /([^/]+)\/(.*)$/g.exec(url)
            return async.tryEach([
              (cb) => { this.resolveAndSave('localhost/installed_contracts/' + url, null).then((result) => cb(null, result)).catch((error) => cb(error.message)) },
              // eslint-disable-next-line standard/no-callback-literal
              (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.resolveAndSave('localhost/installed_contracts/' + splitted[1] + '/contracts/' + splitted[2], null).then((result) => cb(null, result)).catch((error) => cb(error.message)) } },
              (cb) => { this.resolveAndSave('localhost/node_modules/' + url, null).then((result) => cb(null, result)).catch((error) => cb(error.message)) },
              // eslint-disable-next-line standard/no-callback-literal
              (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.resolveAndSave('localhost/node_modules/' + splitted[1] + '/contracts/' + splitted[2], null).then((result) => cb(null, result)).catch((error) => cb(error.message)) } }],
            (error, result) => {
              if (error) {
                return this.importExternal(url, targetPath, (error, content) => {
                  if (error) return reject(error)
                  resolve(content)
                })
              }
              resolve(result)
            })
          }

          this.importExternal(url, targetPath, (error, content) => {
            if (error) return reject(error)
            resolve(content)
          })
        }).catch(error => {
          return reject(error)
        })
      }
    })
  }
}
