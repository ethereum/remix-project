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
        .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c') // this account will be used for this test suite
        .click('#runTabView button[class^="instanceButton"]')
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2) > div > button')
        .click('#runTabView .instance div[class^="title"]')
        .click('#runTabView .instance div[class^="title"]')
        .clickFunction('f - transact (not payable)')
        .testFunction('0x38bb944fa4709ed9e163d6c670259f97284b4defd916d512a2fcc3f35bb53e03',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0x38bb944fa4709ed9e163d6c670259f97284b4defd916d512a2fcc3f35bb53e03',
        'decoded output': { '0': 'uint256: 8' }
      })
        .pause(500)
        .checkTerminalFilter('0x12332162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92782', '')
        .clickFunction('g - transact (not payable)')
        .testFunction('0xab4f794ca0b531f27fc6eace623666b440facbf20e77615a057d728c67b500f0',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0xab4f794ca0b531f27fc6eace623666b440facbf20e77615a057d728c67b500f0',
        'decoded output': {
          '0': 'uint256: 345',
          '1': 'string: comment_comment_',
          '2': 'bool: true',
          '3': 'uint256: 4'
        }
      })
        .click('*[data-id="deployAndRunClearInstances"]')
  },

  'Test Complex Return Values': function (browser) {
    browser.testContracts('returnValues.sol', sources[1]['browser/returnValues.sol'], ['testReturnValues'])
      .clickLaunchIcon('udapp')
      .click('#runTabView button[class^="instanceButton"]')
      .waitForElementPresent('.instance:nth-of-type(2)')
      .click('.instance:nth-of-type(2) > div > button')
      .clickFunction('retunValues1 - transact (not payable)')
      .testFunction('0x09c6716a67f0f8c7a0ca2b3ddf59c25982da856a95aefd640b767f9b9feee39d',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0x09c6716a67f0f8c7a0ca2b3ddf59c25982da856a95aefd640b767f9b9feee39d',
        'decoded output': {
          '0': 'bool: _b true',
          '1': 'uint256: _u 345',
          '2': 'int256: _i -345',
          '3': 'address: _a 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c'
        }
      })
      .clickFunction('retunValues2 - transact (not payable)')
      .testFunction('0xe884953e0695399d60914af3e1ea2dad59fe41f3c0c20665c130fa40dd0fb6bf',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0xe884953e0695399d60914af3e1ea2dad59fe41f3c0c20665c130fa40dd0fb6bf',
        'decoded output': {
          '0': 'bytes1: _b 0x12',
          '1': 'bytes2: _b2 0x1223',
          '2': 'bytes3: _b3 0x000000',
          '3': 'bytes: _blit 0x123498',
          '4': 'bytes5: _b5 0x0432450000',
          '5': 'bytes6: _b6 0x234553253200',
          '6': 'string: _str this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string _ this is a long string',
          '7': 'bytes7: _b7 0x03252353253253',
          '8': 'bytes22: _b22 0x32523523532532532523532500000000000000000000',
          '9': 'bytes32: _b32 0x0325235325325235325235325235320000000000000000000000000000000000'
        }
      }).pause(500)
      .clickFunction('retunValues3 - transact (not payable)')
      .testFunction('0xb4108649d5e65a4a0776d6ac98c2c356540a7e99d641705a82352a845d467eb5',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0xb4108649d5e65a4a0776d6ac98c2c356540a7e99d641705a82352a845d467eb5',
        'decoded output': {
          '0': 'uint8: _en 2',
          '1': 'int256[5][]: _a1 1,-45,-78,56,60,-1,42,334,-45455,-446,1,10,-5435,45,-7'
        }
      }).click('*[data-id="deployAndRunClearInstances"]')
  },

  'Test Complex Input Values': function (browser) {
    browser.testContracts('inputValues.sol', sources[2]['browser/inputValues.sol'], ['test'])
        .clickLaunchIcon('udapp')
        .click('#runTabView button[class^="instanceButton"]')
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2) > div > button')
        .clickFunction('inputValue1 - transact (not payable)', {types: 'uint256 _u, int256 _i, string _str', values: '"2343242", "-4324324", "string _ string _  string _  string _  string _  string _  string _  string _  string _  string _"'})
        .testFunction('0xe9678b5486674a0425301a1d7e925c22cfb9f7f7ec6242697d742009f7ef5b97',
      {
        status: '0x1 Transaction mined and execution succeed',
        'transaction hash': '0xe9678b5486674a0425301a1d7e925c22cfb9f7f7ec6242697d742009f7ef5b97',
        'decoded output': {
          '0': 'uint256: _uret 2343242',
          '1': 'int256: _iret -4324324',
          '2': 'string: _strret string _ string _  string _  string _  string _  string _  string _  string _  string _  string _'
        }
      })
        .pause(500)
        .clickFunction('inputValue2 - transact (not payable)', {types: 'uint256[3] _n, bytes8[4] _b8', values: '[1,2,3], ["0x1234000000000000", "0x1234000000000000","0x1234000000000000","0x1234000000000000"]'})
        .testFunction('0x21724b08c3699bda8375803f8dc842194aea370f2aac284e55144b452dca321f', {
          status: '0x1 Transaction mined and execution succeed',
          'transaction hash': '0x21724b08c3699bda8375803f8dc842194aea370f2aac284e55144b452dca321f',
          'decoded output': {
            '0': 'uint256[3]: _nret 1,2,3',
            '1': 'bytes8[4]: _b8ret 0x1234000000000000,0x1234000000000000,0x1234000000000000,0x1234000000000000'
          },
          logs: [
            {
              'from': '0x8c1ed7e19abaa9f23c476da86dc1577f1ef401f5',
              'topic': '0xd30981760edbf605bda8689e945f622877f230c9a77cbfbd448aa4b7d8ac6e7f',
              'event': 'event1',
              'args': {
                '0': '-123',
                '1': '123',
                '2': {
                  'hash': '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
                  'type': 'Indexed'
                },
                '3': '0x12340000',
                '4': 'test _ test _ test _ test test _ test test _ test test _ test test _ test test _ test test _ test ',
                '_i': '-123',
                '_u': '123',
                '_str': {
                  'hash': '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
                  'type': 'Indexed'
                },
                '_b': '0x12340000',
                '_notIndexed': 'test _ test _ test _ test test _ test test _ test test _ test test _ test test _ test test _ test ',
                'length': 5
              }
            }
          ]
        })
      .click('*[data-id="deployAndRunClearInstances"]')
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
