'use strict'

module.exports = {
  contract: `
contract addressLocal {
      function addressLocal () {
          address sender = msg.sender;
      }
  }
`}
