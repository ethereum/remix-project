'use strict'
var yo = require('yo-yo')

module.exports = {
  formatData: formatData,
  extractData: extractData
}

function formatData (key, data) {
  var style = fontColor(data)
  var type = ''
  if (!isArray(data.type) && !isStruct(data.type)) {
    type = data.type
  }
  return yo`<label>${key}: <label style=${style}>${data.self}</label><label style='font-style:italic'> ${type}</label></label>`
}

function extractData (item, key) {
  var ret = {}
  if (isArray(item.type)) {
    ret.children = item.value || []
    ret.self = item.type
  } else if (isStruct(item.type)) {
    ret.children = item.value || []
    ret.self = 'Struct' + '{' + Object.keys(ret.children).length + '}'
  } else {
    ret.children = []
    ret.self = item.value
  }
  ret.type = item.type
  return ret
}

function fontColor (data) {
  var color = '#124B46'
  if (isArray(data.type) || isStruct(data.type)) {
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

function isStruct (type) {
  return type.indexOf('struct') === 0
}
