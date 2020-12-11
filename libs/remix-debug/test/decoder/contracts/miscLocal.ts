'use strict'

module.exports = {
  contract: `
contract miscLocal {
        enum enumDef {
            one,
            two, 
            three, 
            four
        }
        constructor () public {
            bool boolFalse = false;
            bool boolTrue = true;
            enumDef testEnum;
            testEnum = enumDef.three;
            address sender = msg.sender;
            byte _bytes1 = hex"99";
            bytes1 __bytes1 = hex"99";
            bytes2 __bytes2 = hex"99AB";
            bytes4 __bytes4 = hex"99FA";
            bytes6 __bytes6 = hex"99";
            bytes7 __bytes7 = hex"993567";
            bytes8 __bytes8 = hex"99ABD417";
            bytes9 __bytes9 = hex"99156744AF";
            bytes13 __bytes13 = hex"991234234253";
            bytes16 __bytes16 = hex"99AFAD234324";
            bytes24 __bytes24 = hex"99AFAD234324";
            bytes32 __bytes32 = hex"9999ABD41799ABD417";
        }
  }

  contract miscLocal2 {
      constructor () public {
           bytes memory dynbytes = "dynamicbytes";
           string memory smallstring = "test_test_test";
        }
  }
`}
