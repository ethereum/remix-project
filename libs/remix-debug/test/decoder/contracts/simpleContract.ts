'use strict'
module.exports = `
   contract simpleContract {       
        struct structDef {
            uint8 ui;
            string str;
        }
        enum enumDef {
            first,
            second,
            third
        }
        structDef structDec;
        structDef[3] array;
        enumDef enumDec;
    }
    
    contract test1 {
        struct str {
            uint8 ui;
        }
    }

    contract test2 {
        test1.str a;
    }
`
