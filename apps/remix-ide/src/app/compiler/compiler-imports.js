'use strict'
const globalRegistry = require('../../global/registry')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')()
var resolver = require('@resolver-engine/imports').ImportsEngine()
var request = require('request')
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

const profile = {
  name: 'contentImport',
  displayName: 'content import',
  version: packageJson.version,
  methods: ['resolve']
}

module.exports = class CompilerImports extends Plugin {
  constructor () {
    super(profile)
    this.previouslyHandled = {} // cache import so we don't make the request at each compilation.
  }

  handleGithubCall (root, path, cb) {
    let param = '?'
    // const token = await this.call('settings', 'getGithubAccessToken')
    const token = globalRegistry.get('config').api.get('settings/gist-access-token') // TODO replace with the plugin call above https://github.com/ethereum/remix-ide/issues/2288
    param += token ? 'access_token=' + token : ''
    const regex = path.match(/blob\/([^/]+)\/(.*)/)
    if (regex) {
      // if we have /blob/master/+path we extract the branch name "master" and add it as a parameter to the github api
      // the ref can be branch name, tag, commit id
      const reference = regex[1]
      param += '&ref=' + reference
      path = path.replace(`blob/${reference}/`, '')
    }
    return request.get(
      {
        url: 'https://api.github.com/repos/' + root + '/contents/' + path + param,
        json: true
      },
      (err, r, data) => {
        if (err) {
          return cb(err || 'Unknown transport error')
        }
        if ('content' in data) {
          cb(null, base64.decode(data.content), root + '/' + path)
        } else if ('message' in data) {
          cb(data.message)
        } else {
          cb('Content not received')
        }
      })
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
      let temp = loadingCb
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
    var handlers = this.handlers()

    var found = false
    handlers.forEach(function (handler) {
      if (found) {
        return
      }

      var match = handler.match.exec(url)
      if (match) {
        found = true

        loadingCb('Loading ' + url + ' ...')
        handler.handler(match, function (err, content, cleanUrl) {
          if (err) {
            cb('Unable to import "' + cleanUrl + '": ' + err)
            return
          }
          self.previouslyHandled[url] = {
            content: content,
            cleanUrl: cleanUrl,
            type: handler.type
          }
          cb(null, content, cleanUrl, handler.type, url)
        })
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
      err
      cb('Unable to import "' + url + '": File not found')
    })
  }
}
