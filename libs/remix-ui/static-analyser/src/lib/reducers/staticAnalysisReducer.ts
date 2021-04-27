import remixLib from '@remix-project/remix-lib'
import * as _ from 'lodash'
const StaticAnalysisRunner = require('@remix-project/remix-analyzer').CodeAnalysis

const utils = remixLib.util

const runner = new StaticAnalysisRunner()

const preProcessModules = (arr: any) => {
  return arr.map((Item, i) => {
    const itemObj = new Item()
    itemObj._index = i
    itemObj.categoryDisplayName = itemObj.category.displayName
    itemObj.categoryId = itemObj.category.id
    return itemObj
  })
}

const groupedModules = utils.groupBy(
  preProcessModules(runner.modules()),
  'categoryId'
)

const getIndex = (modules, array) => {
  Object.values(modules).map((value: {_index}) => {
    if (Array.isArray(value)) {
      value.forEach((x) => {
        array.push(x._index.toString())
      })
    } else {
      array.push(value._index.toString())
    }
  })
}
const groupedModuleIndex = (modules) => {
  const indexOfCategory = []
  if (!_.isEmpty(modules)) {
    getIndex(modules, indexOfCategory)
  }
  return indexOfCategory
}

export const initialState = { categoryIndex: [] }

export const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return { ...state, categoryIndex: groupedModuleIndex(groupedModules) }
    case 'uncheck':
      return {
        ...state,
        categoryIndex: state.categoryIndex.filter((el) => {
          return !action.payload.includes(el)
        })
      }
    case 'check':
      return { ...state, categoryIndex: _.uniq([...state.categoryIndex, ...action.payload]) }
    case 'uncheckSingle':
      return { ...state, categoryIndex: state.categoryIndex.filter(val => val !== action.payload) }
    case 'checkSingle':
      return { ...state, categoryIndex: _.uniq([...state.categoryIndex, action.payload]) }
    default:
      return { ...state, categoryIndex: groupedModuleIndex(groupedModules) }
  }
}
