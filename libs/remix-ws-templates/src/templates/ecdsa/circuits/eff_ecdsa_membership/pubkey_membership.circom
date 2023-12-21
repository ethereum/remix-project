pragma circom 2.1.2;

include "./eff_ecdsa.circom";
include "./tree.circom";
include "../poseidon/poseidon.circom";

/**
 *  PubkeyMembership
 *  ================
 *  
 *  Checks that an inputted efficient ECDSA signature (definition and discussion 
 *  can be found at https://personaelabs.org/posts/efficient-ecdsa-1/) 
 *  is signed by a public key that is in a Merkle tree of public keys. Avoids the
 *  SNARK-unfriendly Keccak hash that must be performed when validating if the 
 *  public key is in a Merkle tree of addresses.
 */
template PubKeyMembership(nLevels) {
    signal input s;
    signal input root;
    signal input Tx; 
    signal input Ty; 
    signal input Ux;
    signal input Uy;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    component ecdsa = EfficientECDSA();
    ecdsa.Tx <== Tx;
    ecdsa.Ty <== Ty;
    ecdsa.Ux <== Ux;
    ecdsa.Uy <== Uy;
    ecdsa.s <== s;

    component pubKeyHash = Poseidon();
    pubKeyHash.inputs[0] <== ecdsa.pubKeyX;
    pubKeyHash.inputs[1] <== ecdsa.pubKeyY;

    component merkleProof = MerkleTreeInclusionProof(nLevels);
    merkleProof.leaf <== pubKeyHash.out;

    for (var i = 0; i < nLevels; i++) {
        merkleProof.pathIndices[i] <== pathIndices[i];
        merkleProof.siblings[i] <== siblings[i];
    }
    root === merkleProof.root;
}