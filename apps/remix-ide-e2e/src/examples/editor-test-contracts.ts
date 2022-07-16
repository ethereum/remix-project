// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testContract = {
    name: 'test.sol',
    content: `
  // SPDX-License-Identifier: GPL-3.0
  pragma solidity >=0.7.0 <0.9.0;
  
  import "contracts/base.sol";
  
  contract test is base {
      string public publicstring;
      string private privatestring;
      string internal internalstring;
  
      struct TestBookDefinition { 
        string title;
        string author;
        uint book_id;
      }
      TestBookDefinition public mybook;
      enum MyEnum{ SMALL, MEDIUM, LARGE }
      event MyEvent(uint abc);
  
     modifier costs(uint price) {
        if (msg.value >= price) {
           _;
        }
     }
      constructor(){        
          
      }
  
      function testing() public view {
          
      }
  
      function myprivatefunction() private   {
          
      }
  
      function myinternalfunction() internal    {
          
      }
  
      function myexternalfunction() external    {
          
      }
  }`}
  
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const baseContract = {
    name: 'base.sol',
    content: `
  // SPDX-License-Identifier: GPL-3.0
  pragma solidity >=0.7.0 <0.9.0;
  
  import "contracts/baseofbase.sol";
  
  contract base is baseofbase {
      event BaseEvent(address indexed _from, uint _value);
      enum BaseEnum{ SMALL, MEDIUM, LARGE }
      struct Book { 
          string title;
          string author;
          uint book_id;
      }
      Book public book;
  }`}
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const baseOfBaseContract = {
    name: 'baseofbase.sol',
    content: `
  // SPDX-License-Identifier: GPL-3.0
  pragma solidity >=0.7.0 <0.9.0;
  
  contract baseofbase {
    
      struct BaseBook { 
          string title;
          string author;
          uint book_id;
      }
      BaseBook public basebook;
  
      string private basestring;
      string internal internalbasestring;
  
      function privatebase() private {
          
      }
  
      function internalbasefunction() internal {
  
      }
  
      function publicbasefunction() public {
  
      }
      function externalbasefunction() external  {
      }
  }`}

  export default {
    testContract,
    baseContract,
    baseOfBaseContract
  }