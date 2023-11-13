import * as multihash from 'multihashes'
import { BigNumber, utils } from 'ethers'

export const SignalToBigNumber = (message: string) => {
            // **************************************************************
        // **************** Convert CID to Big Number ***************
        const tmpArray = multihash.fromB58String(message)
        const b58decoded = multihash.decode(tmpArray).digest
        const tmpHexStr = utils.hexlify(b58decoded)
        const signal = BigNumber.from(tmpHexStr, 16).toString()
        return signal
}

export const BigNumberToSignal = (signal: string) => {
            // **************************************************************
        // Convert the signal back to the original CID
        const tmpBNtoHex = utils.hexlify(
            BigNumber.from(signal)
        );
        const tmpHextoBytes = utils.arrayify(tmpBNtoHex);
        const tmpBytestoArr = multihash.encode(tmpHextoBytes, "sha2-256");
        const mhBuf = multihash.encode(tmpBytestoArr, "sha2-256");
        const decodedBuf = multihash.decode(mhBuf);
        const encodedStr = multihash.toB58String(decodedBuf.digest);
        console.log("Recovered CID Value: ", encodedStr);
        return encodedStr
        // **************************************************************
}
