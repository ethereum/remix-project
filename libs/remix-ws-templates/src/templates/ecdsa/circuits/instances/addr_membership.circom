pragma circom 2.1.2;

include "../eff_ecdsa_membership/addr_membership.circom";

component main { public[ root, Tx, Ty, Ux, Uy ]} = AddrMembership(20);