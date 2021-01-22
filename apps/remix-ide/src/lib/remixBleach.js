/*
 * remixBleach
 * a minimal html sanitizer
 * credits to cam@onswipe.com
 */
import * as he from 'he'

const remixBleach = {

  matcher: /<\/?([a-zA-Z0-9]+)*(.*?)\/?>/igm,

  whitelist: [
    'a',
    'b',
    'p',
    'em',
    'strong'
  ],

  analyze: function (html) {
    html = String(html) || ''

    const matches = []
    let match

    // extract all tags
    while ((match = remixBleach.matcher.exec(html)) != null) {
      const attrr = match[2].split(' ')
      const attrs = []

      // extract attributes from the tag
      attrr.shift()
      attrr.forEach((attr) => {
        attr = attr.split('=')
        const attrName = attr[0]
        let attrValue = attr.length > 1 ? attr.slice(1).join('=') : null
        // remove quotes from attributes
        if (attrValue && attrValue.charAt(0).match(/'|"/)) attrValue = attrValue.slice(1)
        if (attrValue && attrValue.charAt(attrValue.length - 1).match(/'|"/)) attrValue = attrValue.slice(0, -1)
        attr = {
          name: attrName,
          value: attrValue
        }
        if (!attr.value) delete attr.value
        if (attr.name) attrs.push(attr)
      })

      var tag = {
        full: match[0],
        name: match[1],
        attr: attrs
      }

      matches.push(tag)
    }

    return matches
  },

  sanitize: function (html, options) {
    html = String(html) || ''
    options = options || {}

    const mode = options.mode || 'white'
    const list = options.list || remixBleach.whitelist

    var matches = remixBleach.analyze(html)

    if ((mode === 'white' && list.indexOf('script') === -1) ||
       (mode === 'black' && list.indexOf('script') !== -1)) {
      html = html.replace(/<script(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/script>/gim, '')
    }

    if ((mode === 'white' && list.indexOf('style') === -1) ||
       (mode === 'black' && list.indexOf('style') !== -1)) {
      html = html.replace(/<style(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/style>/gim, '')
    }

    matches.forEach(function (tag) {
      if (mode === 'white') {
        if (list.indexOf(tag.name) === -1) {
          html = html.replace(tag.full, '')
        }
      } else if (mode === 'black') {
        if (list.indexOf(tag.name) !== -1) {
          html = html.replace(tag.full, '')
        }
      } else {
        throw new Error('Unknown sanitization mode "' + mode + '"')
      }
    })

    if (options.encode_entities) html = he.encode(html)

    return html
  }
}

module.exports = remixBleach
