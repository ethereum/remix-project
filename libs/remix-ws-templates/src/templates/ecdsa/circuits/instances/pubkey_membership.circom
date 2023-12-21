pragma circom 2.1.2;

include "../eff_ecdsa_membership/pubkey_membership.circom";

component main { public[ root, Tx, Ty, Ux, Uy ]} = PubKeyMembership(20);