'use strict'
module.exports = `
    contract baseContract {
        uint8 u;
    }
    
    contract contractUint is baseContract {
        uint256 ui;
        uint ui1;
        bytes16 b;
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
    
    contract contractEnum {
        enum enumDef {item0,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14,item15,item16,item17,item18,item19,item20,item21,item22,item23,item24,item25,item26,item27,item28,item29,item30,item31,item32,item33,item34,item35,item36,item37,item38,item39,item40,item41,item42,item43,item44,item45,item46,item47,item48,item49,item50,item51,item52,item53,item54,item55,item56,item57,item58,item59,item60,item61,item62,item63,item64,item65,item66,item67,item68,item69,item70,item71,item72,item73,item74,item75,item76,item77,item78,item79,item80,item81,item82,item83,item84,item85,item86,item87,item88,item89,item90,item91,item92,item93,item94,item95,item96,item97,item98,item99,item100,item101,item102,item103,item104,item105,item106,item107,item108,item109,item110,item111,item112,item113,item114,item115,item116,item117,item118,item119,item120,item121,item122,item123,item124,item125,item126,item127,item128,item129,item130,item131,item132,item133,item134,item135,item136,item137,item138,item139,item140,item141,item142,item143,item144,item145,item146,item147,item148,item149,item150,item151,item152,item153,item154,item155,item156,item157,item158,item159,item160,item161,item162,item163,item164,item165,item166,item167,item168,item169,item170,item171,item172,item173,item174,item175,item176,item177,item178,item179,item180,item181,item182,item183,item184,item185,item186,item187,item188,item189,item190,item191,item192,item193,item194,item195,item196,item197,item198,item199,item200,item201,item202,item203,item204,item205,item206,item207,item208,item209,item210,item211,item212,item213,item214,item215,item216,item217,item218,item219,item220,item221,item222,item223,item224,item225,item226,item227,item228,item229,item230,item231,item232,item233,item234,item235,item236,item237,item238,item239,item240,item241,item242,item243,item244,item245,item246,item247,item248,item249,item250,item251,item252,item253,item254,item255,item256,item257,item258,item259,item260,item261,item262,item263,item264,item265,item266,item267,item268,item269,item270,item271,item272,item273,item274,item275,item276,item277,item278,item279,item280,item281,item282,item283,item284,item285,item286,item287,item288,item289,item290,item291,item292,item293,item294,item295,item296,item297,item298,item299,item100000000}
        enumDef enum1;
    }
    
    contract contractSmallVariable {
        int8 i8;
        uint8 iu8;
        uint16 iu18;
        int32 i32;
        uint ui32;
        int16 i16;
    }
    
    contract testSimpleStorage1 {
        uint32 uibase1;
    }

    contract testSimpleStorage is testSimpleStorage1 {
        uint ui1;
        uint ui2;
        uint[1] ui3;
        uint[][1][4] ui4;
        
        int16 i16;
        
        struct structDef {
            uint ui;
            string str;
        }
        
        structDef structDec;
        
        structDef[3] arrayStructDec;
        
        int32 i32;
        int16 i16_2;
        
        enum enumDef {
            first,
            second,
            third
        }
        
        enumDef enumDec;
        bool boolean;
        
        uint[][2][][3] ui5;
        
        string _string;
    }
`
