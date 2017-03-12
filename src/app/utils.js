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

module.exports = {
  errortype: errortype,
  groupBy: groupBy
}
