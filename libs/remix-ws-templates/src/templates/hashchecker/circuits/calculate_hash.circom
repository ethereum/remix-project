pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CalculateHash() {
    signal input value1;
    signal input value2;
    signal input value3;
    signal input value4;
    signal output out;

    component poseidon = Poseidon(4);

    poseidon.inputs[0] <== value1;
    poseidon.inputs[1] <== value2;
    poseidon.inputs[2] <== value3;
    poseidon.inputs[3] <== value4;

    out <== poseidon.out;
}
template HashChecker() {
    signal input value1;
    signal input value2;
    signal input value3;
    signal input value4;
    signal input hash;

    component calculateSecret = CalculateHash();
    calculateSecret.value1 <== value1;
    calculateSecret.value2 <== value2;
    calculateSecret.value3 <== value3;
    calculateSecret.value4 <== value4;

    signal calculatedHash;
    calculatedHash <== calculateSecret.out;

    assert(hash == calculatedHash);
    
}

component main {public [hash]} = HashChecker();
