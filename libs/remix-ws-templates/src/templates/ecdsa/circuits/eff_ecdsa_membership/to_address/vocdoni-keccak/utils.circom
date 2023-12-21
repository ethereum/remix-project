pragma circom 2.0.2;

include "circomlib/circuits/gates.circom";
include "circomlib/circuits/sha256/xor3.circom";
include "circomlib/circuits/sha256/shift.circom"; // contains ShiftRight

template Xor5(n) {
    signal input a[n];
    signal input b[n];
    signal input c[n];
    signal input d[n];
    signal input e[n];
    signal output out[n];
    var i;
    
    component xor3 = Xor3(n);
    for (i=0; i<n; i++) {
        xor3.a[i] <== a[i];
        xor3.b[i] <== b[i];
        xor3.c[i] <== c[i];
    }
    component xor4 = XorArray(n);
    for (i=0; i<n; i++) {
        xor4.a[i] <== xor3.out[i];
        xor4.b[i] <== d[i];
    }
    component xor5 = XorArray(n);
    for (i=0; i<n; i++) {
        xor5.a[i] <== xor4.out[i];
        xor5.b[i] <== e[i];
    }
    for (i=0; i<n; i++) {
        out[i] <== xor5.out[i];
    }
}

template XorArray(n) {
    signal input a[n];
    signal input b[n];
    signal output out[n];
    var i;

    component aux[n];
    for (i=0; i<n; i++) {
        aux[i] = XOR();
        aux[i].a <== a[i];
        aux[i].b <== b[i];
    }
    for (i=0; i<n; i++) {
        out[i] <== aux[i].out;
    }
}

template XorArraySingle(n) {
    signal input a[n];
    signal output out[n];
    var i;

    component aux[n];
    for (i=0; i<n; i++) {
        aux[i] = XOR();
        aux[i].a <== a[i];
        aux[i].b <== 1;
    }
    for (i=0; i<n; i++) {
        out[i] <== aux[i].out;
    }
}

template OrArray(n) {
    signal input a[n];
    signal input b[n];
    signal output out[n];
    var i;

    component aux[n];
    for (i=0; i<n; i++) {
        aux[i] = OR();
        aux[i].a <== a[i];
        aux[i].b <== b[i];
    }
    for (i=0; i<n; i++) {
        out[i] <== aux[i].out;
    }
}

template AndArray(n) {
    signal input a[n];
    signal input b[n];
    signal output out[n];
    var i;

    component aux[n];
    for (i=0; i<n; i++) {
        aux[i] = AND();
        aux[i].a <== a[i];
        aux[i].b <== b[i];
    }
    for (i=0; i<n; i++) {
        out[i] <== aux[i].out;
    }
}

template ShL(n, r) {
    signal input in[n];
    signal output out[n];

    for (var i=0; i<n; i++) {
        if (i < r) {
            out[i] <== 0;
        } else {
            out[i] <== in[ i-r ];
        }
    }
}
