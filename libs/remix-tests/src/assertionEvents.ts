const assertionEvents = [
  {
    name: 'AssertionEvent',
    params: ['bool', 'string', 'string']
  },
  {
    name: 'AssertionEventUint',
    params: ['bool', 'string', 'string', 'uint256', 'uint256']
  },
  {
    name: 'AssertionEventInt',
    params: ['bool', 'string', 'string', 'int256', 'int256']
  },
  {
    name: 'AssertionEventBool',
    params: ['bool', 'string', 'string', 'bool', 'bool']
  },
  {
    name: 'AssertionEventAddress',
    params: ['bool', 'string', 'string', 'address', 'address']
  },
  {
    name: 'AssertionEventBytes32',
    params: ['bool', 'string', 'string', 'bytes32', 'bytes32']
  },
  {
    name: 'AssertionEventString',
    params: ['bool', 'string', 'string', 'string', 'string']
  },
  {
    name: 'AssertionEventUintInt',
    params: ['bool', 'string', 'string', 'uint256', 'int256']
  },
  {
    name: 'AssertionEventIntUint',
    params: ['bool', 'string', 'string', 'int256', 'uint256']
  }
]

export default assertionEvents
