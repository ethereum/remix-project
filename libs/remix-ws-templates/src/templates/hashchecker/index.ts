export default async () => {
  return {
    // @ts-ignore
    'circuits/calculate_hash.circom': (await import('raw-loader!./circuits/calculate_hash.circom')).default,
    // @ts-ignore
    'scripts/run_setup.ts': (await import('!!raw-loader!./scripts/run_setup.ts')).default,
    // @ts-ignore
    'scripts/run_verification.ts': (await import('!!raw-loader!./scripts/run_verification.ts')).default,
    // @ts-ignore
    'templates/groth16_verifier.sol.ejs': (await import('!!raw-loader!./templates/groth16_verifier.sol.ejs')).default,
    // @ts-ignore
    'README.txt': (await import('raw-loader!./README.txt')).default
  }
}