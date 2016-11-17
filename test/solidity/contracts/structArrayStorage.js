'use strict'

module.exports = {
  contract: `contract structArrayStorage {
    struct intStruct {
        int8 i8;
        int16 i16;
        uint32 ui32;
        int i256;
        uint16 ui16;
        int32 i32;
    }
    intStruct intStructDec;
    function structArrayStorage () {
        intStructDec.i8 = 32;
        intStructDec.i16 = -54;
        intStructDec.ui32 = 128;
        intStructDec.i256 = -1243565465756;
        intStructDec.ui16 = 34556;
        intStructDec.i32 = -345446546;
    }
}
`,
  storage: {
    '0x0000000000000000000000000000000000000000000000000000000000000000': '0x0000000000000000000000000000000000000000000000000000000080ffca20',
    '0x0000000000000000000000000000000000000000000000000000000000000001': '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffede75b8df64',
    '0x0000000000000000000000000000000000000000000000000000000000000002': '0x0000000000000000000000000000000000000000000000000000eb68e76e86fc'
  }
}
