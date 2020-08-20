const assertionEvents = [
    {
        name: 'AssertionEvent',
        params: ['bool', 'string']
    },
    {
        name: 'AssertionEventUint',
        params: ['bool', 'string', 'uint256', 'uint256']
    },
    {
        name: 'AssertionEventInt',
        params: ['bool', 'string', 'int256', 'int256']
    },
    {
        name: 'AssertionEventBool',
        params: ['bool', 'string', 'bool', 'bool']
    },
    {
        name: 'AssertionEventAddress',
        params: ['bool', 'string', 'address', 'address']
    }
]

export default assertionEvents