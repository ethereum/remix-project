module.exports = {
  contract: `

  pragma solidity ^0.8;

  contract MyContract {
      OtherContract myCall;
      constructor () {
          myCall = new OtherContract();
      }
      function callOther() public { 
          
          // Call 'doSomething' in the other contract
          bool result;
          (result, ) = address(myCall).call(abi.encodeWithSignature("doSomething()"));
  
          result;
          (result, ) = address(myCall).call(abi.encodeWithSignature("doSomething()"));
      }
  
      function callOther2() public {        
          // Call 'doSomething' in the other contract
          myCall.doSomething();
          myCall.doSomething();
      }
  }
  
  // Assuming 'doSomething' in the other contract's code reverts due to some error...
  contract OtherContract {
      uint p;
      function doSomething() public returns(bool) { 
          p = 234;
          revert("revert");
      }
  
      function v() public returns (uint) { return p;}
  }
  `
}
