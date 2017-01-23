'use strict'
var yo = require('yo-yo')
var BN = require('ethereumjs-util').BN

module.exports = {
  formatData: formatData,
  extractProperties: extractProperties,
  extractData: extractData
}

function formatData (key, data) {
  var style = fontColor(data)
  var keyStyle = data.isProperty ? 'color:#847979' : ''
  if (data.type === 'string') {
    data.self = JSON.stringify(data.self)
  }
  return yo`<label style=${keyStyle}>${key}: <label style=${style}>${data.self}</label><label style='font-style:italic'> ${data.isProperty ? '' : data.type}</label></label>`
}

function extractProperties (data, parent, key) {
  var ret = {}
  if (isArray(data.type)) {
    var length = new BN(data.length.replace('0x', ''), 16)
    ret['length'] = {
      self: length.toString(10),
      type: 'uint',
      isProperty: true
    }
  }
  return ret
}

function extractData (item, parent, key) {
  var ret = {}
  if (item.type.lastIndexOf(']') === item.type.length - 1) {
    ret.children = item.value || []
    ret.isArray = true
    ret.self = parent.isArray ? 'Array' : item.type
    ret.length = item.length
  } else if (item.type.indexOf('struct') === 0) {
    ret.children = item.value || []
    ret.self = item.type
    ret.isStruct = true
  } else {
    ret.children = []
    ret.self = item.value
    ret.type = item.type
  }
  return ret
}

function fontColor (data) {
  var color = '#124B46'
  if (data.isArray || data.isStruct) {
    color = '#847979'
  } else if (data.type.indexOf('uint') === 0 ||
              data.type.indexOf('int') === 0 ||
              data.type.indexOf('bool') === 0 ||
              data.type.indexOf('enum') === 0) {
    color = '#0F0CE9'
  } else if (data.type === 'string') {
    color = '#E91E0C'
  }
  return 'color:' + color
}

function isArray (type) {
  return type.lastIndexOf(']') === type.length - 1
}

