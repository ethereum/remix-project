// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testContract = {
  name: 'contracts/test.sol',
  content: `
  // SPDX-License-Identifier: GPL-3.0
  pragma solidity >=0.7.0 <0.9.0;
  
  import "contracts/base.sol";
  import "contracts/import1.sol";

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
      importcontract importedcontract;
  
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
  name: 'contracts/base.sol',
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
  name: 'contracts/baseofbase.sol',
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

const import1Contract = {
  name: 'contracts/import1.sol',
  content: `
    // SPDX-License-Identifier: MIT
    pragma solidity >=0.7.0 <0.9.0;

    import "contracts/importbase.sol";
    import "contracts/secondimport.sol";

contract importcontract is importbase {
    struct ImportedBook { 
        string title;
        string author;
        uint book_id;
    }
    ImportedBook  public importedbook;

    string private importprivatestring;
    string internal internalimportstring;
    string public importpublicstring;

    function privateimport() private {
        
    }

    function internalimport() internal {
        
    }

    function publicimport() public {

    }

    function externalimport() external  {
    }
}`}

const importbase = {
  name: 'contracts/importbase.sol',
  content: `
  // SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract importbase {
    string public importbasestring;
}
`}

const secondimport = {
  name: 'contracts/secondimport.sol',
  content: `
  // SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract secondimport {
    string public secondimportstring;
}
`}

export default {
  testContract,
  baseContract,
  baseOfBaseContract,
  import1Contract,
  importbase,
  secondimport
}