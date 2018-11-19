'use strict'

module.exports = {
  contract: `
contract structArrayLocal {
    struct teststruct {
        string a;
        int b;
        string c;
        int d;
        bool e;
    }
    
    enum enumdef
    {
        one,
        two,
        three
    }    
    
    struct teststructArray {
        string[] a;
        int8[3] b;
        enumdef c;
    }    
    
    constructor () public {
        bytes memory bytesSimple = "test_super";
        teststruct memory e;
        e.a = "test";
        e.b = 5;
        string memory f = "test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_";
        e.c = "test_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_test";
        e.d = 3;
        e.e = true;
        
        int[5] memory simpleArray;
        simpleArray[0] = 45;
        simpleArray[1] = 324324;
        simpleArray[2] = -333;
        simpleArray[3] = 5656;
        simpleArray[4] = -1111;
        
        string[3] memory stringArray;
        stringArray[0] = "long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_";
        stringArray[1] = "two";
        stringArray[2] = "three";
        
        int[][3] memory dynArray;
        dynArray[0] = new int[](1);
        dynArray[1] = new int[](2);
        dynArray[2] = new int[](3);
        dynArray[0][0] = 3423423532;
        dynArray[1][0] = -342343323532;
        dynArray[1][1] = 23432;
        dynArray[2][0] = -432432;
        dynArray[2][1] = 3423423532;
        dynArray[2][2] = -432432;
        
        teststruct[3] memory structArray;
        structArray[0] = e;
        
        structArray[1].a = "item1 a";
        structArray[1].b = 20;
        structArray[1].c = "item1 c";
        structArray[1].d = -45;
        structArray[1].e = false;
        
        structArray[2].a = "item2 a";
        structArray[2].b = 200;
        structArray[2].c = "item2 c";
        structArray[2].d = -450;
        structArray[2].e = true;
        
        teststructArray memory arrayStruct;
        arrayStruct.a = new string[](1);
        arrayStruct.a[0] = "string";
        arrayStruct.b[0] = 34;
        arrayStruct.b[1] = -23;
        arrayStruct.b[2] = -3;
        arrayStruct.c = enumdef.three;
    }
}
`}
