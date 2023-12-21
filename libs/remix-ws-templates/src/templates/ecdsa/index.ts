export default async () => {
  return {
    // @ts-ignore
    'circuits/eff_ecdsa_membership/secp256k1/add.circom': (await import('raw-loader!./circuits/eff_ecdsa_membership/secp256k1/add.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/secp256k1/double.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/secp256k1/double.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/secp256k1/mul.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/secp256k1/mul.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/keccak.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/keccak.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/permutations.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/permutations.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/utils.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/to_address/vocdoni-keccak/utils.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/to_address/zk-identity/eth.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/to_address/zk-identity/eth.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/addr_membership.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/addr_membership.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/eff_ecdsa_to_addr.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/eff_ecdsa_to_addr.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/eff_ecdsa.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/eff_ecdsa.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/pubkey_membership.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/pubkey_membership.circom')).default,
    // @ts-ignore
    'circuits/eff_ecdsa_membership/tree.circom': (await import('!!raw-loader!./circuits/eff_ecdsa_membership/tree.circom')).default,
    // @ts-ignore
    'circuits/instances/addr_membership.circom': (await import('!!raw-loader!./circuits/instances/addr_membership.circom')).default,
    // @ts-ignore
    'circuits/instances/pubkey_membership.circom': (await import('!!raw-loader!./circuits/instances/pubkey_membership.circom')).default,
    // @ts-ignore
    'circuits/poseidon/poseidon_constants.circom': (await import('!!raw-loader!./circuits/poseidon/poseidon_constants.circom')).default,
    // @ts-ignore
    'circuits/poseidon/poseidon.circom': (await import('!!raw-loader!./circuits/poseidon/poseidon.circom')).default,
    // @ts-ignore
    'scripts/run_setup.ts': (await import('!!raw-loader!./scripts/run_setup.ts')).default,
    // @ts-ignore
    'scripts/run_verification.ts': (await import('!!raw-loader!./scripts/run_verification.ts')).default,
    // @ts-ignore
    'templates/groth16_verifier.sol.ejs': (await import('!!raw-loader!./templates/groth16_verifier.sol.ejs')).default,
    // @ts-ignore
    'README.md': (await import('raw-loader!./README.md')).default
  }
}