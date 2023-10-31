pragma circom 2.0.0;

template Multiplier2() {
    signal input a;
    signal input b;
    signal output c;
    signal output d;
    c <== a*b;
    d <== c*b;
 }

 component main = Multiplier2();
 