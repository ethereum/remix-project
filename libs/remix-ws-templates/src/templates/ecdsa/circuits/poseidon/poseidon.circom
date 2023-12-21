pragma circom 2.1.2;

include "./poseidon_constants.circom";

template SBox() {
    signal input in;
    signal output out;

    signal inDouble <== in * in;
    signal inQuadruple <== inDouble * inDouble;
    

    out <== inQuadruple * in;
}

template MatrixMul() {
    var t = 3;
    signal input state[t];
    signal output out[t];
    var mds_matrix[t][t] = MDS_MATRIX();

    for (var i = 0; i < t; i++) {
        var tmp = 0;
        for (var j = 0; j < t; j++) {
            tmp += state[j] * mds_matrix[i][j];
        }
        out[i] <== tmp;
    }
}

template AddRoundConst(pos) {
    var t = 3;
    signal input state[t];
    signal output out[t]; 
    var round_keys[192] = ROUND_KEYS();

    for (var i = 0; i < t; i++) {
        out[i] <== state[i] + round_keys[pos + i];
    }
}

template FullRound(pos) {
    var t = 3;
    signal input state[t];
    signal output out[t];
    component constAdded = AddRoundConst(pos);
    for (var i = 0; i < t; i++) {
        constAdded.state[i] <== state[i];
    }


    component sBoxes[t];
    for (var i = 0; i < t; i++) {
        sBoxes[i] = SBox();
        sBoxes[i].in <== constAdded.out[i];
    }

    component matrixMul = MatrixMul();
    for (var i = 0; i < t; i++) {
        matrixMul.state[i] <== sBoxes[i].out;
    }

    for (var i = 0; i < t; i++) {
        out[i] <== matrixMul.out[i];
    }
}

template PartialRound(pos) {
    var t = 3;
    signal input state[t];
    signal output out[t];

    component constAdded = AddRoundConst(pos);
    for (var i = 0; i < t; i++) {
        constAdded.state[i] <== state[i];
    }

    component sBox = SBox();
    sBox.in <== constAdded.out[0];

    component matrixMul = MatrixMul();
    for (var i = 0; i < t; i++) {
        if (i == 0) {
            matrixMul.state[i] <== sBox.out;
        } else {
            matrixMul.state[i] <== constAdded.out[i];
        }
    }

    for (var i = 0; i < t; i++) {
        out[i] <== matrixMul.out[i];
    }
}

template Poseidon() {
    var numInputs = 2;
    var t = numInputs + 1;
    signal input inputs[numInputs];
    var numFullRoundsHalf = 4;
    var numPartialRounds = 56;
    signal output out;

    var stateIndex = 0;
    
    signal initState[3];

    initState[0] <== 3;
    initState[1] <== inputs[0];
    initState[2] <== inputs[1];

    component fRoundsFirst[numFullRoundsHalf];
    for (var j = 0; j < numFullRoundsHalf; j++) {
        fRoundsFirst[j] = FullRound(stateIndex * t);
        if (j == 0) {
            for (var i = 0; i < t; i++) {
                fRoundsFirst[j].state[i] <== initState[i];
            }
        } else {
            for (var i = 0; i < t; i++) {
                fRoundsFirst[j].state[i] <== fRoundsFirst[j - 1].out[i];
            }
        }
        stateIndex++;
    }


    component pRounds[numPartialRounds];
    for (var j = 0; j < numPartialRounds; j++) {
        pRounds[j] = PartialRound(stateIndex * t);
        if (j == 0) {
            for (var i = 0; i < t; i++) {
                pRounds[j].state[i] <== fRoundsFirst[numFullRoundsHalf - 1].out[i];
            }
        } else {
            for (var i = 0; i < t; i++) {
                pRounds[j].state[i] <== pRounds[j - 1].out[i];
            }
        }
        stateIndex++;
    }

    component fRoundsLast[numFullRoundsHalf];
    for (var j = 0; j < numFullRoundsHalf; j++) {
        fRoundsLast[j] = FullRound(stateIndex * t);
        if (j == 0) {
            for (var i = 0; i < t; i++) {
                fRoundsLast[j].state[i] <== pRounds[numPartialRounds - 1].out[i];
            }
        } else {
            for (var i = 0; i < t; i++) {
                fRoundsLast[j].state[i] <== fRoundsLast[j - 1].out[i];
            }
        }
        stateIndex++;
    }

    out <== fRoundsLast[numFullRoundsHalf-1].out[1];
}
