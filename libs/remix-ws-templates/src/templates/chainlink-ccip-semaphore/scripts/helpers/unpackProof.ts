import { SnarkJSProof, Proof } from "@semaphore-protocol/proof"

/**
 * Unpacks a proof into its original form.
 * @param proof The proof compatible with Semaphore.
 * @returns The proof compatible with SnarkJS.
 */
export default function unpackProof(proof: Proof): SnarkJSProof {
    return {
        pi_a: [proof[0], proof[1]],
        pi_b: [
            [proof[3], proof[2]],
            [proof[5], proof[4]]
        ],
        pi_c: [proof[6], proof[7]],
        protocol: "groth16",
        curve: "bn128"
    }
}