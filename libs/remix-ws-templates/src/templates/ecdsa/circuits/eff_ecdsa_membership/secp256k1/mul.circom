pragma circom 2.1.2;

include "./add.circom";
include "./double.circom";
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/gates.circom";

// 

/**
 *  Secp256k1Mul
 *  ============
 *
 *  Implements https://zcash.github.io/halo2/design/gadgets/ecc/var-base-scalar-mul.html
 *  which allows us to use incomplete addition for the majority of the addition steps
 *  and only use complete addition for the final 3 steps.
 */
template Secp256k1Mul() {
    var bits = 256;
    signal input scalar;
    signal input xP; 
    signal input yP;
    signal output outX;
    signal output outY;

    component kBits = K();
    kBits.s <== scalar;

    component acc0 = Secp256k1Double();
    acc0.xP <== xP;
    acc0.yP <== yP;

    component PIncomplete[bits-3]; 
    component accIncomplete[bits];

    for (var i = 0; i < bits-3; i++) {
        if (i == 0) {
            PIncomplete[i] = Secp256k1AddIncomplete(); // (Acc + P)
            PIncomplete[i].xP <== xP; // kBits[i] ? xP : -xP;
            PIncomplete[i].yP <== -yP;// kBits[i] ? xP : -xP;
            PIncomplete[i].xQ <== acc0.outX;
            PIncomplete[i].yQ <== acc0.outY;
            

            accIncomplete[i] = Secp256k1AddIncomplete(); // (Acc + P) + Acc
            accIncomplete[i].xP <== acc0.outX;
            accIncomplete[i].yP <== acc0.outY;
            accIncomplete[i].xQ <== PIncomplete[i].outX;
            accIncomplete[i].yQ <== PIncomplete[i].outY;
        } else {
            PIncomplete[i] = Secp256k1AddIncomplete(); // (Acc + P)
            PIncomplete[i].xP <== xP; // k_i ? xP : -xP;
            PIncomplete[i].yP <== (2 * kBits.out[bits-i] - 1) * yP;// k_i ? xP : -xP;
            PIncomplete[i].xQ <== accIncomplete[i-1].outX;
            PIncomplete[i].yQ <== accIncomplete[i-1].outY;

            accIncomplete[i] = Secp256k1AddIncomplete(); // (Acc + P) + Acc
            accIncomplete[i].xP <== accIncomplete[i-1].outX;
            accIncomplete[i].yP <== accIncomplete[i-1].outY;
            accIncomplete[i].xQ <== PIncomplete[i].outX;
            accIncomplete[i].yQ <== PIncomplete[i].outY;
        }
    }

    component PComplete[bits-3]; 
    component accComplete[3];

    for (var i = 0; i < 3; i++) {
        PComplete[i] = Secp256k1AddComplete(); // (Acc + P)

        PComplete[i].xP <== xP; // k_i ? xP : -xP;
        PComplete[i].yP <== (2 * kBits.out[3 - i] - 1) * yP;// k_i ? xP : -xP;
        if (i == 0) {
            PComplete[i].xQ <== accIncomplete[252].outX;
            PComplete[i].yQ <== accIncomplete[252].outY;
        } else {
            PComplete[i].xQ <== accComplete[i-1].outX;
            PComplete[i].yQ <== accComplete[i-1].outY;
        }

        accComplete[i] = Secp256k1AddComplete(); // (Acc + P) + Acc
        if (i == 0) {
            accComplete[i].xP <== accIncomplete[252].outX;
            accComplete[i].yP <== accIncomplete[252].outY;
        } else {
            accComplete[i].xP <== accComplete[i-1].outX;
            accComplete[i].yP <== accComplete[i-1].outY;
        }

        accComplete[i].xQ <== PComplete[i].outX;
        accComplete[i].yQ <== PComplete[i].outY;
    }

    component out = Secp256k1AddComplete();
    out.xP <== accComplete[2].outX;
    out.yP <== accComplete[2].outY;
    out.xQ <== (1 - kBits.out[0]) * xP;
    out.yQ <== (1 - kBits.out[0]) * -yP;

    outX <== out.outX;
    outY <== out.outY;
}

// Calculate k = (s + tQ) % q as follows:
// Define notation: (s + tQ) / q = (quotient, remainder)
// We can calculate the quotient and remainder as:
// (s + tQ) < q ? = (0, s - tQ) : (1, (s - tQ) - q)
// We use 128-bit registers to calculate the above since (s + tQ) can be larger than p.
template K() {
    var bits = 256;
    signal input s;
    signal output out[bits];

    // Split elemnts into 128 bit registers

    var q = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141; // The order of the scalar field
    var qlo = q & ((2 ** 128) - 1);
    var qhi = q >> 128;
    var tQ = 115792089237316195423570985008687907852405143892509244725752742275123193348738; // (q - 2^256) % q;
    var tQlo = tQ & (2 ** (128) - 1);
    var tQhi = tQ >> 128;
    signal slo <-- s & (2 ** (128) - 1);
    signal shi <-- s >> 128;

    // Get carry bit of (slo + tQlo)

    component inBits = Num2Bits(128 + 1);
    inBits.in <== slo + tQlo;
    signal carry <== inBits.out[128];

    // check a >= b
    // where
    // a = (s + tQ)
    // b = q

    // - alpha: ahi > bhi
    // - beta: ahi = bhi
    // - gamma: alo ≥ blo
    // if alpha or (beta and gamma) then a >= b
    
    signal ahi <== shi + tQhi + carry;
    signal bhi <== qhi;
    signal alo <== slo + tQlo - (carry * 2 ** 128);
    signal blo <== qlo;

    component alpha = GreaterThan(129);
    alpha.in[0] <== ahi;
    alpha.in[1] <== bhi;

    component beta = IsEqual();
    beta.in[0] <== ahi;
    beta.in[1] <== bhi;

    component gamma = GreaterEqThan(129);
    gamma.in[0] <== alo;
    gamma.in[1] <== blo;

    component betaANDgamma = AND();
    betaANDgamma.a <== beta.out;
    betaANDgamma.b <== gamma.out;

    component isQuotientOne = OR();
    isQuotientOne.a <== betaANDgamma.out;
    isQuotientOne.b <== alpha.out;

    // theta: (slo + tQlo) < qlo
    component theta = GreaterThan(129);
    theta.in[0] <== qlo;
    theta.in[1] <== slo + tQlo;

    // borrow: (slo + tQlo) < qlo and isQuotientOne ? 1 : 0
    component borrow = AND();
    borrow.a <== theta.out;
    borrow.b <== isQuotientOne.out;

    signal klo <== (slo + tQlo + borrow.out * (2 ** 128)) - isQuotientOne.out * qlo;
    signal khi <== (shi + tQhi - borrow.out * 1)  - isQuotientOne.out * qhi;

    component kloBits = Num2Bits(256);
    kloBits.in <== klo;

    component khiBits = Num2Bits(256);
    khiBits.in <== khi;

    for (var i = 0; i < 128; i++) {
        out[i] <== kloBits.out[i];
        out[i + 128] <== khiBits.out[i];
    }
}