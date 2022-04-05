'use strict'

export const defaultContract = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title ContractName
 * @dev ContractDescription
 * @custom:dev-run-script ./scripts/<file name>.ts
 */
contract ContractName {

    /**
     * @dev function_1 description
     */
    function function_1() public {
        // code
    }

    /**
     * @dev function_2 description
     */
    function function_2() public {
        // code
    }
}`

export const defaultScript = `
(async () => {
    try {
        console.log('running script ...')
    } catch (e) {
        console.log(e.message)
    }
})()
`
