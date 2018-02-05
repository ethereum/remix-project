'use strict'
// TODO: can just use request or fetch instead
var $ = require('jquery')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')
var request = require('

module.exports = {
  handleGithubCall: function (root, path, cb) {
    return request.get(
    {
      url: 'https://api.github.com/repos/' + root + '/contents/' + path,
      json: true,
      headers: {
        'User-Agent': 'Remix'
      }
    }, (err, r, data) => {
      if (err) {
        return cb(err || 'Unknown transport error')
      }
      if ('content' in data) {
        cb(null, base64.decode(data.content), root + '/' + path)
      } else {
        cb('Content not received')
      }
    });
  },

  handleSwarmImport: function (url, cb) {
    swarmgw.get(url, function (err, content) {
      cb(err, content, url)
    })
  },

  handleIPFS: function (url, cb) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')

    return $.ajax({ type: 'GET', url: 'https://gateway.ipfs.io/' + url })
      .done(function (data) {
        cb(null, data, url)
      })
      .fail(function (xhr, text, err) {
        // NOTE: on some browsers, err equals to '' for certain errors (such as offline browser)
        cb(err || 'Unknown transport error')
      })
  },

  handlers: function () {
    return [
      { type: 'github', match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/, handler: (match, cb) => { this.handleGithubCall(match[3], match[4], cb) } },
      { type: 'swarm', match: /^(bzz[ri]?:\/\/?.*)$/, handler: (match, cb) => { this.handleSwarmImport(match[1], cb) } },
      { type: 'ipfs', match: /^(ipfs:\/\/?.+)/, handler: (match, cb) => { this.handleIPFS(match[1], cb) } }
    ]
  },

  import: function (url, loadingCb, cb) {
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

          cb(null, content, cleanUrl, handler.type, url)
        })
      }
    })

    if (found) {
      return
    } else if (/^[^:]*:\/\//.exec(url)) {
      cb('Unable to import "' + url + '": Unsupported URL schema')
    } else {
      cb('Unable to import "' + url + '": File not found')
    }
  }
}
