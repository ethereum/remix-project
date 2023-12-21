pragma circom 2.0.2;

include "../vocdoni-keccak/keccak.circom";

include "circomlib/circuits/bitify.circom";

/*
 * Possibly generalizable, but for now just flatten a single pubkey from k n-bit chunks to a * single bit array
 * representing the entire pubkey
 *
 */
template FlattenPubkey(numBits, k) {
  signal input chunkedPubkey[2][k];

  signal output pubkeyBits[512];

  // must be able to hold entire pubkey in input
  assert(numBits*k >= 256);

  // convert pubkey to a single bit array
  // - concat x and y coords
  // - convert each register's number to corresponding bit array
  // - concatenate all bit arrays in order

  component chunks2BitsY[k];
  for(var chunk = 0; chunk < k; chunk++){
    chunks2BitsY[chunk] = Num2Bits(numBits);
    chunks2BitsY[chunk].in <== chunkedPubkey[1][chunk];

    for(var bit = 0; bit < numBits; bit++){
        var bitIndex = bit + numBits * chunk;
        if(bitIndex < 256) {
          pubkeyBits[bitIndex] <== chunks2BitsY[chunk].out[bit];
        }
    }
  }

  component chunks2BitsX[k];
  for(var chunk = 0; chunk < k; chunk++){
    chunks2BitsX[chunk] = Num2Bits(numBits);
    chunks2BitsX[chunk].in <== chunkedPubkey[0][chunk];

    for(var bit = 0; bit < numBits; bit++){
        var bitIndex = bit + 256 + (numBits * chunk);
        if(bitIndex < 512) {
          pubkeyBits[bitIndex] <== chunks2BitsX[chunk].out[bit];
        }
    }
  }
}

/*
 * Helper for verifying an eth address refers to the correct public key point
 *
 * NOTE: uses https://github.com/vocdoni/keccak256-circom, a highly experimental keccak256 implementation
 */
template PubkeyToAddress() {
    // public key is (x, y) curve point. this is a 512-bit little-endian bitstring representation of y + 2**256 * x
    signal input pubkeyBits[512];

    signal output address;

    // our representation is little-endian 512-bit bitstring
    // keccak template operates on bytestrings one byte at a time, starting with the biggest byte
    // but bytes are represented as little-endian 8-bit bitstrings
    signal reverse[512];

    for (var i = 0; i < 512; i++) {
      reverse[i] <== pubkeyBits[511-i];
    }

    component keccak = Keccak(512, 256);
    for (var i = 0; i < 512 / 8; i += 1) {
      for (var j = 0; j < 8; j++) {
        keccak.in[8*i + j] <== reverse[8*i + (7-j)];
      }
    }

    // convert the last 160 bits (20 bytes) into the number corresponding to address
    // the output of keccak is 32 bytes. bytes are arranged from largest to smallest
    // but bytes themselves are little-endian bitstrings of 8 bits
    // we just want a little-endian bitstring of 160 bits
    component bits2Num = Bits2Num(160);
    for (var i = 0; i < 20; i++) {
      for (var j = 0; j < 8; j++) {
        bits2Num.in[8*i + j] <== keccak.out[256 - 8*(i+1) + j];
      }
    }

    address <== bits2Num.out;
}