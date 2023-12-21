pragma circom 2.1.2;

include "./eff_ecdsa.circom";
include "./to_address/zk-identity/eth.circom";

/**
 *  EfficientECDSAToAddr
 *  ====================
 *  
 *  Converts inputted efficient ECDSA signature to an address.
 */
template EfficientECDSAToAddr() {
    var bits = 256;
    signal input s;
    signal input Tx; // T = r^-1 * R
    signal input Ty; 
    signal input Ux; // U = -(m * r^-1 * G)
    signal input Uy;
    signal output addr;
    
    component effEcdsa = EfficientECDSA();
    effEcdsa.s <== s;
    effEcdsa.Tx <== Tx;
    effEcdsa.Ty <== Ty;
    effEcdsa.Ux <== Ux;
    effEcdsa.Uy <== Uy;

    component pubKeyXBits = Num2Bits(256);
    pubKeyXBits.in <== effEcdsa.pubKeyX;

    component pubKeyYBits = Num2Bits(256);
    pubKeyYBits.in <== effEcdsa.pubKeyY;

    component pubToAddr = PubkeyToAddress();

    for (var i = 0; i < 256; i++) {
        pubToAddr.pubkeyBits[i] <== pubKeyYBits.out[i];
        pubToAddr.pubkeyBits[i + 256] <== pubKeyXBits.out[i];
    }

    addr <== pubToAddr.address;
}
