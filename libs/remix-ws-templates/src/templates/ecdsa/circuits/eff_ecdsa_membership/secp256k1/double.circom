pragma circom 2.1.2;

/**
 *  Secp256k1Double
 *  ===============
 *
 *  Double a specific point (xP, yP) on the secp256k1 curve. Should work for any 
 *  short Weierstrass curve (Pasta, P-256).
 */
template Secp256k1Double() {
    signal input xP; 
    signal input yP;

    signal output outX;
    signal output outY;

    signal lambda;
    signal xPSquared;

    xPSquared <== xP * xP;

    lambda <-- (3 * xPSquared) / (2 * yP);
    lambda * 2 * yP === 3 * xPSquared;

    outX <== lambda * lambda - (2 * xP);
    outY <== lambda * (xP - outX) - yP;
}
