'use strict'

function errortype (message) {
  return message.match(/^(.*:[0-9]*:[0-9]* )?Warning: /) ? 'warning' : 'error'
}

function groupBy (arr, key) {
  return arr.reduce((sum, item) => {
    const groupByVal = item[key]
    var groupedItems = sum[groupByVal] || []
    groupedItems.push(item)
    sum[groupByVal] = groupedItems
    return sum
  }, {})
}

function concatWithSeperator (list, seperator) {
  return list.reduce((sum, item) => sum + item + seperator, '').slice(0, -seperator.length)
}

function escapeRegExp (str) {
  return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&')
}

module.exports = {
  errortype: errortype,
  groupBy: groupBy,
  concatWithSeperator: concatWithSeperator,
  escapeRegExp: escapeRegExp
}
