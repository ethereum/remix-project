const url = require('url')
const validUrl = require('valid-url')
const resolve = require('./resolve.js')
/*
combineSource(//basepath, //sources object)
*/
const combineSource = async function (rootpath, sources) {
  let fn, importLine, ir
  var matches = []
  ir = /^(?:import){1}(.+){0,1}\s['"](.+)['"];/gm
  let match = null
  for (const fileName of Object.keys(sources)) {
    const source = sources[fileName].content
    while ((match = ir.exec(source))) {
      matches.push(match)
    }
    for (let match of matches) {
      importLine = match[0]
      const extra = match[1] ? match[1] : ''
      if (validUrl.isUri(rootpath)) {
        fn = url.resolve(rootpath, match[2])
      } else {
        fn = match[2]
      }
      try {
        // resolve anything other than remix_tests.sol & tests.sol
        if (fn.localeCompare('remix_tests.sol') !== 0 && fn.localeCompare('tests.sol') !== 0) {
          let subSorce = {}
          const response = await resolve(rootpath, fn)
          sources[fileName].content = sources[fileName].content.replace(importLine, 'import' + extra + ' \'' + response.filename + '\';')
          subSorce[response.filename] = { content: response.content }
          sources = Object.assign(await combineSource(response.rootpath, subSorce), sources)
        }
      } catch (e) {
        throw e
      }
    }
  }
  return sources
}

module.exports = { combineSource }
