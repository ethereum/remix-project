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
  new txOrigin(),
  new gasCosts(),
  new thisLocal(),
  new checksEffectsInteraction(),
  new constantFunctions(),
  new similarVariableNames(),
  new inlineAssembly(),
  new blockTimestamp(),
  new lowLevelCalls(),
  new blockBlockhash(),
  new noReturn(),
  new selfdestruct(),
  new guardConditions(),
  new deleteDynamicArrays(),
  new assignAndCompare(),
  new erc20Decimals(),
  new stringBytesLength(),
  new deleteFromDynamicArray(),
  new forLoopIteratesOverDynamicArray()
]
