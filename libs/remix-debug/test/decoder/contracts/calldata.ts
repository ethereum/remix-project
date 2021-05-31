'use strict'

module.exports = {
  contract: `
  pragma experimental ABIEncoderV2;
  contract calldataLocal {
    constructor () public {     
    }
    
    function level11(uint8[1] calldata foo, string[2][1] calldata boo) public {
      uint p = 45;
    }
  }
`}
