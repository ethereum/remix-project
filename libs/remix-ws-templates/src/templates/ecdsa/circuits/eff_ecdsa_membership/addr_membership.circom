pragma circom 2.1.2;

include "./eff_ecdsa.circom";
include "./tree.circom";
include "./to_address/zk-identity/eth.circom";

/**
 *  AddrMembership
 *  ==============
 *  
 *  Checks that an inputted efficient ECDSA signature (definition and discussion 
 *  can be found at https://personaelabs.org/posts/efficient-ecdsa-1/) 
 *  is signed by a public key that when converted to an address is a member of
 *  a Merkle tree of addresses. The public key is extracted from the efficient 
 *  ECDSA signature in EfficientECDSA(), and converted to an address by Keccak
 *  hashing the public key in PubkeyToAddress().
 */
template AddrMembership(nLevels) {
    signal input s;
    signal input root;
    signal input Tx; 
    signal input Ty; 
    signal input Ux;
    signal input Uy;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    component effEcdsa = EfficientECDSA();
    effEcdsa.Tx <== Tx;
    effEcdsa.Ty <== Ty;
    effEcdsa.Ux <== Ux;
    effEcdsa.Uy <== Uy;
    effEcdsa.s <== s;

    component pubKeyXBits = Num2Bits(256);
    pubKeyXBits.in <== effEcdsa.pubKeyX;

    component pubKeyYBits = Num2Bits(256);
    pubKeyYBits.in <== effEcdsa.pubKeyY;

    component pubToAddr = PubkeyToAddress();

    for (var i = 0; i < 256; i++) {
        pubToAddr.pubkeyBits[i] <== pubKeyYBits.out[i];
        pubToAddr.pubkeyBits[i + 256] <== pubKeyXBits.out[i];
    }

    component merkleProof = MerkleTreeInclusionProof(nLevels);
    merkleProof.leaf <== pubToAddr.address;

    for (var i = 0; i < nLevels; i++) {
        merkleProof.pathIndices[i] <== pathIndices[i];
        merkleProof.siblings[i] <== siblings[i];
    }

    root === merkleProof.root;
}