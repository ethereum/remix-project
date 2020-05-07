'use strict'

export const groupBy = (arr, key) => {
  return arr.reduce((sum, item) => {
    const groupByVal = item[key]
    const groupedItems = sum[groupByVal] || []
    groupedItems.push(item)
    sum[groupByVal] = groupedItems
    return sum
  }, {})
}

export const concatWithSeperator = (list, seperator) => {
  return list.reduce((sum, item) => sum + item + seperator, '').slice(0, -seperator.length)
}

export const escapeRegExp = (str) => {
  return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&')
}
