'use strict'
import { ValueType } from './ValueType'

export class FunctionType extends ValueType {
  constructor (type, stateDefinitions, contractName, location) {
    super(1, 8, 'function')
  }

  decodeValue (value) {
    return 'at program counter ' + value
  }
}
