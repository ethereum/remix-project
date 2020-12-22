'use strict'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import {RemixURLResolver} from '@remix-project/remix-url-resolver'
const remixTests = require('@remix-project/remix-tests')
const globalRegistry = require('../../global/registry')
const addTooltip = require('../ui/tooltip')
const async = require('async')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')()
var resolver = require('@resolver-engine/imports').ImportsEngine()
var request = require('request')

const profile = {
  name: 'contentImport',
  displayName: 'content import',
  version: packageJson.version,
  methods: ['resolve', 'resolveAndSave']
}

module.exports = class CompilerImports extends Plugin {

  constructor (fileManager) {
    super(profile)
    this.fileManager = fileManager
    // const token = await this.call('settings', 'getGithubAccessToken')
    const token = globalRegistry.get('config').api.get('settings/gist-access-token') // TODO replace with the plugin call above https://github.com/ethereum/remix-ide/issues/2288
    this.urlResolver = new RemixURLResolver(token)
    this.previouslyHandled = {} // cache import so we don't make the request at each compilation.
  }

  handleSwarmImport (url, cleanUrl, cb) {
    swarmgw.get(url, function (err, content) {
      cb(err, content, cleanUrl)
    })
  }

  handleIPFS (url, cb) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')

    return request.get(
      {
        url: 'https://ipfsgw.komputing.org/' + url
      },
      (err, r, data) => {
        if (err) {
          return cb(err || 'Unknown transport error')
        }
        cb(null, data, url)
      })
  }

  handleHttpCall (url, cleanUrl, cb) {
    console.log('Inside ide handleHttpCall')
    return request.get(
      {
        url
      },
      (err, r, data) => {
        if (err) {
          return cb(err || 'Unknown transport error')
        }
        cb(null, data, cleanUrl)
      })
  }

  handlers () {
    return [
      { type: 'github', match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/, handler: (match, cb) => { this.handleGithubCall(match[3], match[4], cb) } },
      { type: 'http', match: /^(http?:\/\/?(.*))$/, handler: (match, cb) => { this.handleHttpCall(match[1], match[2], cb) } },
      { type: 'https', match: /^(https?:\/\/?(.*))$/, handler: (match, cb) => { this.handleHttpCall(match[1], match[2], cb) } },
      { type: 'swarm', match: /^(bzz-raw?:\/\/?(.*))$/, handler: (match, cb) => { this.handleSwarmImport(match[1], match[2], cb) } },
      { type: 'ipfs', match: /^(ipfs:\/\/?.+)/, handler: (match, cb) => { this.handleIPFS(match[1], cb) } }
    ]
  }

  isRelativeImport (url) {
    return /^([^/]+)/.exec(url)
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
      })
    })
  }

  import (url, force, loadingCb, cb) {
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
    var handlers = this.urlResolver.getHandlers()

    var found = false
    handlers.forEach(function (handler) {
      if (found) {
        return
      }

      var match = handler.match(url)
      if (match) {
        found = true

        loadingCb('Loading ' + url + ' ...')
        handler.handle(match).then(function(result) { 
          const { content, cleanUrl } = result
          self.previouslyHandled[url] = {
            content,
            cleanUrl,
            type: handler.type
          }
          cb(null, content, cleanUrl, handler.type, url)
        }).catch(function (error) {
            cb('Unable to import url : ' + error)
            return
        }) 
        // function (err, content, cleanUrl) {
        //   if (err) {
            
        //   }
          
          
        // })
      }
    })
    if (found) return

    resolver
      .resolve(url)
      .then(result => {
        return resolver.require(url)
      })
      .then(result => {
        if (url.indexOf(result.provider + ':') === 0) {
          url = url.substring(result.provider.length + 1) // remove the github prefix
        }
        cb(null, result.source, url, result.provider, result.url)
      })
      .catch(err => {
        console.error(err)
        cb('Unable to import "' + url + '": File not found')
      })
  }

  importExternal (url, targetPath, cb) {
    this.import(url,
      // TODO: move to an event that is generated, the UI shouldn't be here
      (loadingMsg) => { addTooltip(loadingMsg) },
      (error, content, cleanUrl, type, url) => {
        if (error) return cb(error)
        if (this.fileManager) {
          const browser = this.fileManager.fileProviderOf('browser/')
          const path = targetPath || type + '/' + cleanUrl
          if (browser) browser.addExternal(path, content, url)
        }
        cb(null, content)
      })
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
        provider.exists(url, (error, exist) => {
          if (error) return reject(error)
          if (!exist && provider.type === 'localhost') return reject(new Error(`not found ${url}`))

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
              (cb) => { this.resolveAndSave('localhost/installed_contracts/' + url).then((result) => cb(null, result)).catch((error) => cb(error.message)) },
              (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.resolveAndSave('localhost/installed_contracts/' + splitted[1] + '/contracts/' + splitted[2]).then((result) => cb(null, result)).catch((error) => cb(error.message)) } },
              (cb) => { this.resolveAndSave('localhost/node_modules/' + url).then((result) => cb(null, result)).catch((error) => cb(error.message)) },
              (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.resolveAndSave('localhost/node_modules/' + splitted[1] + '/contracts/' + splitted[2]).then((result) => cb(null, result)).catch((error) => cb(error.message)) } }],
            (error, result) => {
              if (error) {
                return this.importExternal(url, targetPath, (error, content) => {
                  if (error) return reject(error)
                  resolve(content)
                })
              }
              resolve(result)
            })
          } else {
            // try to resolve external content
            this.importExternal(url, targetPath, (error, content) => {
              if (error) return reject(error)
              resolve(content)
            })
          }
        })
      }
    })
  }
}
