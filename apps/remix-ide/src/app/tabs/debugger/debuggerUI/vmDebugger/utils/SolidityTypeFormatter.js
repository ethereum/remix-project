var yo = require('yo-yo')
var BN = require('ethereumjs-util').BN

module.exports = {
  formatSelf: formatSelf,
  extractData: extractData
}

function formatSelf (key, data) {
  const style = fontColor(data)
  const keyStyle = data.isProperty ? 'color: var(--info)' : ''
  if (data.type === 'string') {
    data.self = JSON.stringify(data.self)
  }
  return yo `<label style='${keyStyle};white-space:pre-wrap;'> ${' ' + key}:<label style=${style}>${' ' + data.self}</label><label style='font-style:italic'> ${data.isProperty || !data.type ? '' : ' ' + data.type}</label></label>`
}

function extractData (item, parent, key) {
  var ret = {}
  if (item.isProperty) {
    return item
  }
  if (item.type.lastIndexOf(']') === item.type.length - 1) {
    ret.children = (item.value || []).map(function (item, index) {
      return {key: index, value: item}
    })
    ret.children.unshift({
      key: 'length',
      value: {
        self: (new BN(item.length.replace('0x', ''), 16)).toString(10),
        type: 'uint',
        isProperty: true
      }
    })
    ret.isArray = true
    ret.self = parent.isArray ? '' : item.type
  } else if (item.type.indexOf('struct') === 0) {
    ret.children = Object.keys((item.value || {})).map(function (key) {
      return {key: key, value: item.value[key]}
    })
    ret.self = item.type
    ret.isStruct = true
  } else if (item.type.indexOf('mapping') === 0) {
    ret.children = Object.keys((item.value || {})).map(function (key) {
      return {key: key, value: item.value[key]}
    })
    ret.isMapping = true
    ret.self = item.type
  } else {
    ret.children = null
    ret.self = item.value
    ret.type = item.type
  }
  return ret
}

function fontColor (data) {
  let color = 'var(--primary)'
  if (data.isArray || data.isStruct || data.isMapping) {
    color = 'var(--info)'
  } else if (
    data.type.indexOf('uint') === 0 ||
    data.type.indexOf('int') === 0 ||
    data.type.indexOf('bool') === 0 ||
    data.type.indexOf('enum') === 0
  ) {
    color = 'var(--green)'
  } else if (data.type === 'string') {
    color = 'var(--teal)'
  } else if (data.self == 0x0) { // eslint-disable-line
    color = 'var(--gray)'
  }
  return 'color:' + color
}

