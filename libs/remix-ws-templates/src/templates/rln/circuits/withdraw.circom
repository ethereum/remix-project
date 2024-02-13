pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

template Withdraw() {
    signal input identitySecret;
    signal input address;

    signal output identityCommitment <== Poseidon(1)([identitySecret]);

    // Dummy constraint to prevent compiler optimizing it
    signal addressSquared <== address * address;
}

component main { public [address] } = Withdraw();
