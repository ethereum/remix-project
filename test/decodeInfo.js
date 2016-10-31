'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../src/index')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compile(contracts, 0)

    var stateDec = index.solidity.astHelper.extractStateVariables('contractUint', output.sources)
    var decodeInfo = index.solidity.decodeInfo.decode(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 1, 'uint8')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 32, 'uint256')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 32, 'uint256')

    stateDec = index.solidity.astHelper.extractStateVariables('contractStructAndArray', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 64, 'struct structDef')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 192, 'struct structDef[3]')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 48, 'bytes12[4]')

    stateDec = index.solidity.astHelper.extractStateVariables('contractArray', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 4 * 5, 'uint32[5]')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 32, 'int8[]')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 4 * 32, 'int16[][3][][4]')
    st.end()
  })
})

function checkDecodeInfo (st, decodeInfo, freeSlot, storageBytes, typeName, name) {
  st.equal(decodeInfo.needsFreeStorageSlot, freeSlot)
  st.equal(decodeInfo.storageBytes, storageBytes)
  st.equal(decodeInfo.typeName, typeName)
}

var contracts = `
    contract baseContract {
        uint8 u;
    }
    
    contract contractUint is baseContract {
        uint256 ui;
        uint ui1;
    }    
    
    contract contractStructAndArray {       
        struct structDef {
            uint8 ui;
            string str;
        }
        structDef structDec;
        structDef[3] array;
        bytes12[4] bytesArray;
    }
    
    contract contractArray {
        uint32[5] i32st;
        int8[] i8dyn;
        int16[][3][][4] i16dyn;    
    }  
`
