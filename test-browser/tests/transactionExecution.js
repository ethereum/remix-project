'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },

  'Execute Simple Contract and Test Terminal': function (browser) {
    browser.testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['TestContract'])
        .clickLaunchIcon('udapp')
        .click('#runTabView button[class^="instanceButton"]')
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2) > div > button')
        .click('#runTabView .instance div[class^="title"]')
        .click('#runTabView .instance div[class^="title"]')
        .testFunction('f - transact (not payable)',
          '0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc',
          `[vm]\nfrom:0xca3...a733c\nto:TestContract.f() 0x692...77b3a\nvalue:0 wei\ndata:0x261...21ff0\nlogs:0\nhash:0xa17...523bc`, null,
          `{
  "0": "uint256: 8"
  }`)
        .pause(500)
        .checkTerminalFilter('0x12332162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92782', '')
        .testFunction('g - transact (not payable)',
          '0xb1532162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92781',
          `[vm]\nfrom:0xca3...a733c\nto:TestContract.g() 0x692...77b3a\nvalue:0 wei\ndata:0xe21...79b8e\nlogs:0\nhash:0xb15...92781`, null, `{
  "0": "uint256: 345",
  "1": "string: comment_comment_",
  "2": "bool: true",
  "3": "uint256: 4"
  }`)
        .click('i[class^="clearinstance"]')
  },

  'Test Complex Return Values': function (browser) {
    browser.testContracts('returnValues.sol', sources[1]['browser/returnValues.sol'], ['testReturnValues'])
      .clickLaunchIcon('udapp')
      .click('#runTabView button[class^="instanceButton"]')
      .waitForElementPresent('.instance:nth-of-type(2)')
      .click('.instance:nth-of-type(2) > div > button')
      .testFunction('retunValues1 - transact (not payable)',
        '0xc3660c7ab6899f196e77d3ab3749169e22c00ae7f1b8fe3af0ce54df49504019',
        `[vm]\nfrom:0xca3...a733c\nto:testReturnValues.retunValues1() 0x5e7...26e9f\nvalue:0 wei\ndata:0x9ed...59eb7\nlogs:0\nhash:0xc36...04019`,
        null,
        `{
 "0": "bool: _b true",
 "1": "uint256: _u 345",
 "2": "int256: _i -345",
 "3": "address: _a 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c"
}`)
      .testFunction('retunValues2 - transact (not payable)',
        '0xc8cc8150fcb0b09cdf51e7357341272118888fe8c4efe32881b56e891377aad9',
        `[vm]\nfrom:0xca3...a733c\nto:testReturnValues.retunValues2() 0x5e7...26e9f\nvalue:0 wei\ndata:0xf57...4036c\nlogs:0\nhash:0xc8c...7aad9`, null, `{
 "0": "bytes1: _b 0x12",
 "1": "bytes2: _b2 0x1223",
 "2": "bytes3: _b3 0x000000",
 "3": "bytes: _blit 0x123498",
 "4": "bytes5: _b5 0x0432450000",
 "5": "bytes6: _b6 0x234553253200",
 "6": "string: _str this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string",
 "7": "bytes7: _b7 0x03252353253253",
 "8": "bytes22: _b22 0x32523523532532532523532500000000000000000000",
 "9": "bytes32: _b32 0x0325235325325235325235325235320000000000000000000000000000000000"
}`).pause(500).testFunction('retunValues3 - transact (not payable)',
        '0x94c4b4324bad773dec29af3ffe26a698c32b5caf8a1eedf8889563158639d28a',
        '[vm]\nfrom:0xca3...a733c\nto:testReturnValues.retunValues3() 0x5e7...26e9f\nvalue:0 wei\ndata:0x033...e0a7d\nlogs:0\nhash:0x94c...9d28a', null, `{
 "0": "uint8: _en 2",
 "1": "int256[5][]: _a1 1,-45,-78,56,60,-1,42,334,-45455,-446,1,10,-5435,45,-7"
}`).click('i[class^="clearinstance"]')
  },

  'Test Complex Input Values': function (browser) {
    browser.testContracts('inputValues.sol', sources[2]['browser/inputValues.sol'], ['test'])
        .clickLaunchIcon('udapp')
        .click('#runTabView button[class^="instanceButton"]')
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2) > div > button')
        .testFunction('inputValue1 - transact (not payable)',
        '0xf3265e3d9cd9299958bf81bed3cdfdd537942f85b9e0b95c5468c691d9396505',
        `[vm]\nfrom:0xca3...a733c\nto:test.inputValue1(uint256,int256,string) 0x8c1...401f5\nvalue:0 wei\ndata:0xd69...00000\nlogs:0\nhash:0xf32...96505`,
        {types: 'uint256 _u, int256 _i, string _str', values: '"2343242", "-4324324", "string _ string _  string _  string _  string _  string _  string _  string _  string _  string _"'},
        `{
 "0": "uint256: _uret 2343242",
 "1": "int256: _iret -4324324",
 "2": "string: _strret string _ string _  string _  string _  string _  string _  string _  string _  string _  string _"
}`)
        .pause(500)
        .testFunction('inputValue2 - transact (not payable)',
        '0xd9ec6d8aa73d81755447190f52939ee3084e105b988d445a11e7ac718392ff5a',
        `[vm]\nfrom:0xca3...a733c\nto:test.inputValue2(uint256[3],bytes8[4]) 0x8c1...401f5\nvalue:0 wei\ndata:0x1b7...00000\nlogs:1\nhash:0xd9e...2ff5a`,
        {types: 'uint256[3] _n, bytes8[4] _b8', values: '[1,2,3], ["0x1234000000000000", "0x1234000000000000","0x1234000000000000","0x1234000000000000"]'},
        `{
 "0": "uint256[3]: _nret 1,2,3",
 "1": "bytes8[4]: _b8ret 0x1234000000000000,0x1234000000000000,0x1234000000000000,0x1234000000000000"
}`, `[
  {
   "from": "0x8c1ed7e19abaa9f23c476da86dc1577f1ef401f5",
   "topic": "0xd30981760edbf605bda8689e945f622877f230c9a77cbfbd448aa4b7d8ac6e7f",
   "event": "event1",
   "args": {
    "0": "-123",
    "1": "123",
    "2": {
     "hash": "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
     "type": "Indexed"
    },
    "3": "0x12340000",
    "4": "test _ test _ test _ test test _ test test _ test test _ test test _ test test _ test test _ test ",
    "_i": "-123",
    "_u": "123",
    "_str": {
     "hash": "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
     "type": "Indexed"
    },
    "_b": "0x12340000",
    "_notIndexed": "test _ test _ test _ test test _ test test _ test test _ test test _ test test _ test test _ test ",
    "length": 5
   }
  }
 ]`)
      .click('i[class^="clearinstance"]')
      .end()
  },

  tearDown: sauce
}

// @TODO test: bytes8[3][] type as input

var sources = [
  {'browser/Untitled.sol': {content: `
      contract TestContract { function f() public returns (uint) { return 8; }
      function g() public returns (uint, string memory, bool, uint) {
        uint payment = 345;
        bool payed = true;
        string memory comment = "comment_comment_";
        uint month = 4;
        return (payment, comment, payed, month); } }`}},
  {'browser/returnValues.sol': {content: `
  contract testReturnValues {
    enum ActionChoices { GoLeft, GoRight, GoStraight, SitStill }
    function retunValues1 () public returns (bool _b, uint _u, int _i, address _a)  {
        _b = true;
        _u = 345;
        _i = -345;
        _a = msg.sender;
    }

    function retunValues2 () public returns (byte _b, bytes2 _b2, bytes3 _b3, bytes memory _blit, bytes5 _b5, bytes6 _b6, string memory _str, bytes7 _b7, bytes22 _b22, bytes32 _b32)  {
        _b = 0x12;
        _b2 = 0x1223;
        _b5 = hex"043245";
        _b6 = hex"2345532532";
        _b7 = hex"03252353253253";
        _b22 = hex"325235235325325325235325";
        _b32 = hex"032523532532523532523532523532";
        _blit = hex"123498";
        _str = "this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string";
    }

    function retunValues3 () public returns (ActionChoices _en, int[5][] memory _a1)  {
       _en = ActionChoices.GoStraight;
       int[5][] memory a = new int[5][](3);
       a[0] = [int(1),-45,-78,56,60];
       a[1] = [int(-1),42,334,-45455,-446];
       a[2] = [int(1),10,-5435,45,-7];
      _a1 = a;
    }
  }`}},
  {'browser/inputValues.sol': {content: `
  contract test {
    event event1(int _i, uint indexed _u, string indexed _str, bytes4 _b, string _notIndexed);
    function inputValue1 (uint _u, int _i, string memory _str) public returns (uint _uret, int _iret, string memory _strret) {
      _uret = _u;
      _iret = _i;
      _strret = _str;
    }
    function inputValue2 (uint[3] memory _n, bytes8[4] memory _b8) public returns (uint[3] memory _nret, bytes8[4] memory _b8ret){
        _nret = _n;
        _b8ret = _b8;
        emit event1(-123, 123, "test", hex"1234", "test _ test _ test _ test test _ test test _ test test _ test test _ test test _ test test _ test ");
    }
}`}}
]
