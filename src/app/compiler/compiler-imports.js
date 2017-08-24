'use strict'
var $ = require('jquery')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')

module.exports = {
  handleGithubCall: function (root, path, cb) {
    return $.getJSON('https://api.github.com/repos/' + root + '/contents/' + path)
      .done(function (data) {
        if ('content' in data) {
          cb(null, base64.decode(data.content))
        } else {
          cb('Content not received')
        }
      })
      .fail(function (xhr, text, err) {
        // NOTE: on some browsers, err equals to '' for certain errors (such as offline browser)
        cb(err || 'Unknown transport error')
      })
  },

  handleSwarmImport: function (url, cb) {
    swarmgw.get(url, function (err, content) {
      cb(err, content)
    })
  },

  handleIPFS: function (url, cb) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')

    return $.ajax({ type: 'GET', url: 'https://gateway.ipfs.io/' + url })
      .done(function (data) {
        cb(null, data)
      })
      .fail(function (xhr, text, err) {
        // NOTE: on some browsers, err equals to '' for certain errors (such as offline browser)
        cb(err || 'Unknown transport error')
      })
  },

  import: function (url, cb) {
    var handlers = [
      { match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/, handler: (match, cb) => { this.handleGithubCall(match[3], match[4], cb) } },
      { match: /^(bzz[ri]?:\/\/?.*)$/, handler: (match, cb) => { this.handleSwarmImport(match[1], cb) } },
      { match: /^(ipfs:\/\/?.+)/, handler: (match, cb) => { this.handleIPFS(match[1], cb) } }
    ]

    var found = false
    handlers.forEach(function (handler) {
      if (found) {
        return
      }

      var match = handler.match.exec(url)
      if (match) {
        found = true

        $('#output').append($('<div/>').append($('<pre/>').text('Loading ' + url + ' ...')))
        handler.handler(match, function (err, content) {
          if (err) {
            cb('Unable to import "' + url + '": ' + err)
            return
          }

          cb(null, content)
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
