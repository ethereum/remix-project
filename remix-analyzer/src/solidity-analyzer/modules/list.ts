import txOrigin from './txOrigin'
import gasCosts from './gasCosts'
import thisLocal from './thisLocal'
import checksEffectsInteraction from './checksEffectsInteraction'
import constantFunctions from './constantFunctions'
import similarVariableNames from './similarVariableNames'
import inlineAssembly from './inlineAssembly'
import blockTimestamp from './blockTimestamp'
import lowLevelCalls from './lowLevelCalls'
import blockBlockhash from './blockBlockhash'
import noReturn from './noReturn'
import selfdestruct from './selfdestruct'
import guardConditions from './guardConditions'
import deleteDynamicArrays from './deleteDynamicArrays'
import assignAndCompare from './assignAndCompare'
import erc20Decimals from './erc20Decimals'
import stringBytesLength from './stringBytesLength'
import deleteFromDynamicArray from './deleteFromDynamicArray'
import forLoopIteratesOverDynamicArray from './forLoopIteratesOverDynamicArray'

export default [
  txOrigin,
  gasCosts,
  thisLocal,
  checksEffectsInteraction,
  constantFunctions,
  similarVariableNames,
  inlineAssembly,
  blockTimestamp,
  lowLevelCalls,
  blockBlockhash,
  noReturn,
  selfdestruct,
  guardConditions,
  deleteDynamicArrays,
  assignAndCompare,
  erc20Decimals,
  stringBytesLength,
  deleteFromDynamicArray,
  forLoopIteratesOverDynamicArray
]
