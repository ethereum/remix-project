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
import etherTransferInLoop from './etherTransferInLoop'
import intDivisionTruncate from './intDivisionTruncate'

export default [
  txOrigin,
  gasCosts,
  thisLocal,
  checksEffectsInteraction,
  erc20Decimals,
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
  stringBytesLength,
  deleteFromDynamicArray,
  forLoopIteratesOverDynamicArray,
  etherTransferInLoop,
  intDivisionTruncate
]
